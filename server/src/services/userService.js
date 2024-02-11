// Database models
import User from "../database/User.js"

// Classes
import Room from "../classes/Room.js"
import Guest from "../classes/Guest.js"

// Services
import {
  getRoom,
  getRoomUserInfo,
  roomInLobby,
  isUserInRoom,
  deleteRoom,
  removeUserFromRoom,
  isRoomEmpty,
  isHostLeaving,
  generateNewHostInRoom,
  broadcastRoomUserInfo,
} from "./roomService.js"
import { getUserIdsInGame } from "./gameService.js"

const MIN_FIREBASE_UID_LENGTH = 28

function handleNewConnection(userId, socket) {
  // Attaching custom property "userId" to socket.
  // userId (passed in from Firebase) is null if the user isn't registered.
  // We use socket.userId in lieu of passing the Firebase param constantly from client to server.
  // socket.userId encompasses both Auth and Guest users, so it can be
  // thought of as the "server id". The current naming is a bit confusing.
  // It's also important to note that a userId and socket.id cannot overlap;
  // Firebase Auth = 28 chars, socket.id = 20 chars.
  // This is important, or we would have duplicate ids flying around. We'll
  // also exploit this fact when trying to determine whether a socket is a user or not.
  socket.userId = userId ? userId : socket.id

  console.log(`From handleNewConnection: ${socket.userId}`)
}

async function createNewUser(userId) {
  if (userId) {
    try {
      const existingUser = await User.findById(userId).lean()
      if (!existingUser) {
        await User.create({ _id: userId, username: "Guest" })
      }
    } catch (error) {
      console.error(
        `Error initializing user info in the database: ${error.message}`
      )
      throw error
    }

    // TODO: Not sure if we actually need this due to page refreshes on client-side,
    // but it is explicit.
    socket.userId = userId
  }
}

// This only runs for registered users, so no additional checks are needed.
async function getUserStats(userId) {
  try {
    const user = await User.findById(userId).lean()
    if (!user) {
      console.error(`No guest or user found with userId: ${userId}`)
    }
    return user
  } catch (error) {
    console.error(`Error getting user info from the database: ${error.message}`)
    throw error
  }
}

// TODO: These dpName fxns miiight not belong here? They're not db operations.
function setDisplayName(roomId, userId, displayName) {
  const roomUserInfo = getRoomUserInfo(roomId)
  if (roomUserInfo) {
    const previousValue = roomUserInfo.get(userId)
    roomUserInfo.set(userId, { ...previousValue, displayName: displayName })
  }
}

function handleDisplayNameUpdate(roomId, userId, updatedDisplayName, io) {
  if (roomInLobby(roomId) && isUserInRoom(roomId, userId)) {
    setDisplayName(roomId, userId, updatedDisplayName)
    broadcastRoomUserInfo(roomId, io)
  }
}

function dbIsRegistered(userId) {
  // userId can either be exactly 20 chars (default socket.id length; cannot be a user),
  // or 28+ chars (Firebase uid length; must be a user).
  return userId.length >= MIN_FIREBASE_UID_LENGTH ? true : false
}

function dbHasUpdated(userId, hasUpdatedInDbList) {
  return hasUpdatedInDbList.includes(userId)
}

function constructCurrStreakUpdate(userId, winnerId, connectionMode, gameMode) {
  let update = {}

  if (connectionMode === "public") {
    const currStreakPath = `currStreak.${gameMode}`

    if (winnerId === userId) {
      update = { $inc: { [currStreakPath]: 1 } }
    } else {
      update = { $set: { [currStreakPath]: 0 } }
    }
  }

  return update
}

async function constructMaxStreakUpdate(
  userId,
  winnerId,
  connectionMode,
  gameMode
) {
  let update = {}

  const game = getGame()
  const currStreak = game.gameUserInfo.get(userId).currStreak

  if (connectionMode === "public" && winnerId === userId) {
    const maxStreakPath = `maxStreak.${gameMode}`
    const maxStreak = await User.findById(userId, maxStreakPath).lean()

    if (currStreak > maxStreak) {
      update = { $set: { [maxStreakPath]: currStreak } }
    }
  }

  return update
}

function constructTotalGamesUpdate(connectionMode, gameMode) {
  let update = {}
  const game = getGame()
  const countGames = game.round // TODO missing. Also, has a pretty high chance to be inaccurate for our purposes. Triple check this.

  // TODO "game.roundLimit" doesn't exist yet, but it will when we add the customizability.
  if (countGames > 0 && countGames < game.roundLimit) {
    const totalGamesPath = `totalGames.${connectionMode}.${gameMode}`
    update = { $inc: { [totalGamesPath]: countGames } }
  }

  return update
}

function constructTotalWinsUpdate(userId, connectionMode, gameMode) {
  let update = {}
  const game = getGame()
  const countWins = game.gameUserInfo.get(userId).roundsWon // TODO missing

  // i.e. if there's actually a change. else wasting db operation.
  // also some error checking.
  if (countWins > 0 && countWins < game.roundLimit) {
    const totalWinsPath = `totalWins.${connectionMode}.${gameMode}`
    update = { $inc: { [totalWinsPath]: countWins } }
  }

  return update
}

function constructTotalSolveTimeUpdate(userId, connectionMode, gameMode) {
  let update = {}
  const game = getGame()
  const solveTime = game.gameUserInfo.get(userId).solveTime // TODO missing

  if (solveTime !== 0 && solveTime < game.timeLimit) {
    const totalSolveTimePath = `totalSolveTime.${connectionMode}.${gameMode}`
    update = { $inc: { [totalSolveTimePath]: solveTime } }
  }

  return update
}

async function constructSolveDistributionUpdate(
  userId,
  connectionMode,
  gameMode
) {
  let update = {}
  const game = getGame()
  // TODO instead of grabbing the solveDistribution as the initial check,
  // you can just check if totalsolvetime === 0. 0 solve time = 0 new distribution.

  const solveDistributionToAdd = game.gameUserInfo.get(userId).solveDistribution // TODO missing

  const sameDistribution = solveDistributionToAdd.every((value) => value === 0)

  if (!sameDistribution) {
    // Retrieve the old solveDistribution from db and map over the new values.
    const solveDistributionPath = `solveDistribution.${connectionMode}.${gameMode}`

    const oldSolveDistribution = await User.findById(
      userId,
      solveDistributionPath
    ).lean()

    const updatedSolveDistribution = oldSolveDistribution.map(
      (value, index) => {
        return value + solveDistributionToAdd[index]
      }
    )

    update = { $set: { [solveDistributionPath]: updatedSolveDistribution } }
  }
  return update
}

async function dbConstructUserUpdate(
  userId,
  winnerId,
  roomConnectionMode,
  isChallengeMode
) {
  let connectionMode =
    roomConnectionMode === "online-public" ? "public" : "private"
  let gameMode = isChallengeMode ? "challenge" : "normal"

  const currStreakUpdate = constructCurrStreakUpdate(
    userId,
    winnerId,
    connectionMode,
    gameMode
  )

  const maxStreakUpdate = await constructMaxStreakUpdate(
    userId,
    winnerId,
    connectionMode,
    gameMode
  )

  const totalGamesUpdate = constructTotalGamesUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
  )
  const totalWinsUpdate = constructTotalWinsUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
  )
  const totalSolveTimeUpdate = constructTotalSolveTimeUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
  )
  const solveDistribution = await constructSolveDistributionUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
  )

  const userUpdate = {
    ...currStreakUpdate,
    ...maxStreakUpdate,
    ...totalGamesUpdate,
    ...totalWinsUpdate,
    ...totalSolveTimeUpdate,
    ...solveDistribution,
  }

  return userUpdate
}

async function dbUpdateUser(userId, game) {
  if (
    dbIsRegistered(userId) &&
    !dbHasUpdated(userId, game.hasUpdatedInDbList)
  ) {
    try {
      const userUpdate = await dbConstructUserUpdate(
        userId,
        game.winnerId,
        game.roomConnectionMode,
        game.isChallengeMode
      )
      await User.updateOne({ _id: userId }, userUpdate)
    } catch (error) {
      console.error(
        `Error updating user info in the database: ${error.message}`
      )
      throw error
    }
  }
}

async function dbBatchUpdateUsers(game) {
  if (game.winnerId && game.roomConnectionMode && game.isChallengeMode) {
    // We could use a for loop to update each user in the db, but it would
    // be sequential. The following approach allows parallel execution.
    // .map() to create an array of Promises for each user update operation,
    // then Promise.all() to wait for all of them to complete.
    // NOTE: This parallel approach may actually *hinder* the db's performance
    // if our db doesn't handle multiprocessing well. Should test if possible.
    const userIds = game.getUserIdsInGame()
    try {
      const updatePromises = userIds.map((userId) => dbUpdateUser(userId, game))
      await Promise.all(updatePromises)
    } catch (error) {
      console.error(
        `Error batch updating user info in the database: ${error.message}`
      )
      throw error
    }
  }
}

async function handleUserDisconnect(socket, io) {
  console.log(`A user disconnected with userId: ${socket.userId}`)
  handleLeaveRoom(socket, io)
}

async function handleLeaveRoom(socket, io) {
  const roomId = socket.roomId
  if (roomId) {
    console.log(`Removing user ${socket.userId} from ${roomId}`)
    socket.roomId = null
    removeUserFromRoom(socket.userId, roomId)
    if (isRoomEmpty(roomId)) {
      deleteRoom(roomId)
    } else {
      if (isHostLeaving(roomId, socket.userId)) {
        const newHostId = generateNewHostInRoom(roomId)
        io.to(roomId).emit("newHost", newHostId)
      }
    }
  }
  broadcastRoomUserInfo(roomId, io)
}

export {
  handleNewConnection,
  createNewUser,
  setDisplayName,
  handleDisplayNameUpdate,
  handleUserDisconnect,
  handleLeaveRoom,
  dbBatchUpdateUsers,
}
