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

function handleNewConnection(userId, socket) {
  // Attaching custom properties "isUser" and "userId" to socket.
  // userId (passed in from Firebase) is null if the user isn't registered.
  // isUser in particular will be used to check if the db should be updated.
  socket.isUser = userId ? true : false

  // socket.userId will be set and used in lieu of passing around
  // the userId param constantly from client to server.
  // It encompasses both Auth and Guest users, so it can be
  // thought of as the "server id". It's also important to note that a userId
  // and socket.id cannot overlap; Firebase Auth = 28 chars, socket.id = 20 chars.
  // This is important, or we would have duplicate ids flying around.
  socket.userId = userId ? userId : socket.id

  console.log(`From handleNewConnection: ${socket.userId}`)
}

async function createNewUser(userId) {
  if (userId) {
    try {
      const existingUser = await User.findById(userId).lean()
      if (!existingUser) {
        await User.create({ _id: userId, userId: userId })
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

  // It's better to retrieve maxStreak here once.
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

async function constructUserUpdate(
  userId,
  roomConnectionMode,
  isChallengeMode,
  gameResult
) {
  let connectionMode =
    roomConnectionMode === "online-public" ? "public" : "private"
  let gameMode = isChallengeMode ? "challenge" : "normal"

  // TODO: Change order of params (gameResult doesn't exist anymore either)
  const currStreakUpdate = constructCurrStreakUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
  )
  const maxStreakUpdate = await constructMaxStreakUpdate(
    userId,
    connectionMode,
    gameMode,
    gameResult
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

// TODO: We can choose to either pass in the whole game here, or just pick and choose the properties we need, wherever we call dbBatchUpdateUsers (which I assume in in Game.js or gameService.js)
async function dbBatchUpdateUsers(
  roomId,
  roomConnectionMode,
  isChallengeMode,
  gameResult
) {
  if (roomConnectionMode && isChallengeMode && gameResult) {
    // We could use a for loop to update each user in the db, but it would
    // be sequential. The following approach allows parallel execution.
    // .map() to create an array of Promises for each user update operation,
    // then Promise.all() to wait for all of them to complete.
    // NOTE: This parallel approach may actually hinder the db's performance.
    try {
      const userIds = getUserIdsInGame(roomId)
      const updatePromises = userIds.map(async (userId) => {
        const userUpdate = await constructUserUpdate(
          userId,
          roomConnectionMode,
          isChallengeMode,
          gameResult
        )
        await User.updateOne({ _id: userId }, userUpdate)
      })
      await Promise.all(updatePromises)
    } catch (error) {
      console.error(
        `Error updating user info in the database: ${error.message}`
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
