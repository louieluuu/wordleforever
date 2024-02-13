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

async function dbCreateNewUser(userId, username) {
  if (userId && username) {
    try {
      const existingUser = await User.findById(userId).lean()
      if (!existingUser) {
        await User.create({ _id: userId, username: username })
      }
    } catch (error) {
      console.error(
        `Error initializing user info in the database: ${error.message}`
      )
      throw error
    }

    // TODO: Not sure if we actually need this due to page refreshes on client-side, but it is explicit.
    socket.userId = userId
  }
}

async function dbGetUserById(userId) {
  if (userId) {
    try {
      const user = await User.findById(userId).lean()
      if (!user) {
        console.error(`No user found with userId: ${userId}`)
      }
      return user
    } catch (error) {
      console.error(
        `Error getting user info from the database: ${error.message}`
      )
      throw error
    }
  }
}

async function dbGetUserByName(username) {
  if (username) {
    try {
      const user = await User.findOne({ username: username }).lean()
      if (!user) {
        console.error(`No user found with username: ${username}`)
      }
      return user
    } catch (error) {
      console.error(
        `Error getting user info from the database: ${error.message}`
      )
      throw error
    }
  }
}

function dbIsRegistered(userId) {
  // userId can either be exactly 20 chars (default socket.id length; cannot be a user),
  // or 28+ chars (Firebase uid length; must be a user).
  if (userId) {
    return userId.length >= MIN_FIREBASE_UID_LENGTH ? true : false
  }
  return false
}

function dbHasUpdated(userId, hasUpdatedInDbList) {
  if (userId) {
    return hasUpdatedInDbList.includes(userId)
  }
  return true
}

function constructCurrStreakUpdate(isWinner, connectionMode, gameMode) {
  let update = {}

  if (connectionMode === "public") {
    const currStreakPath = `currStreak.${gameMode}`

    if (isWinner) {
      update = { $inc: { [currStreakPath]: 1 } }
    } else {
      update = { $set: { [currStreakPath]: 0 } }
    }
  } else if (connectionMode === "private") {
    // Private games don't have streaks.
  }

  return update
}

async function constructMaxStreakUpdate(
  userId,
  isWinner,
  currStreak,
  connectionMode,
  gameMode
) {
  let update = {}

  if (connectionMode === "public" && isWinner) {
    // Retrieve the current maxStreak from db and compare.
    const maxStreakPath = `maxStreak.${gameMode}`
    const user = await User.findById(userId, maxStreakPath).lean()
    const maxStreak = user[maxStreakPath]

    // TODO actually have to see what the findById returns. Not sure if it's the
    // maxStreakPath directly or the whole user object.

    if (currStreak > maxStreak) {
      update = { $set: { [maxStreakPath]: currStreak } }
    }
  } else if (connectionMode === "private") {
    // Private games don't have streaks.
  }

  return update
}

function constructTotalGamesUpdate(
  connectionMode,
  gameMode,
  totalRounds,
  roundLimit
) {
  let update = {}
  const countGames = totalRounds

  if (countGames > 0 && countGames <= roundLimit) {
    const totalGamesPath = `totalGames.${connectionMode}.${gameMode}`
    update = { $inc: { [totalGamesPath]: countGames } }
  }

  return update
}

function constructTotalWinsUpdate(
  roundsWon,
  connectionMode,
  gameMode,
  roundLimit
) {
  let update = {}

  const countWins = roundsWon
  if (countWins > 0 && countWins <= roundLimit) {
    const totalWinsPath = `totalWins.${connectionMode}.${gameMode}`
    update = { $inc: { [totalWinsPath]: countWins } }
  }

  return update
}

function constructTotalSolveTimeUpdate(
  totalSolveTime,
  connectionMode,
  gameMode,
  timeLimit
) {
  let update = {}

  if (totalSolveTime > 0 && totalSolveTime <= timeLimit) {
    const totalSolveTimePath = `totalSolveTime.${connectionMode}.${gameMode}`
    update = { $inc: { [totalSolveTimePath]: totalSolveTime } }
  }

  return update
}

async function constructSolveDistributionUpdate(
  userId,
  connectionMode,
  gameMode,
  gameUserInfo
) {
  let update = {}

  const solveDistributionToAdd = gameUserInfo.get(userId).solveDistribution
  const sameDistribution = solveDistributionToAdd.every((value) => value === 0)

  if (!sameDistribution) {
    // TODO:
    // Retrieve the old solveDistribution from db and map over the new values.
    // We can't use $inc w/ arrays here. If we were to use an Object, we could.
    // But it'd be uglier syntax.
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

async function dbConstructUserUpdate(userId, game) {
  const currStreakUpdate = constructCurrStreakUpdate(
    game.isWinner(userId),
    game.connectionMode,
    game.gameMode
  )

  const maxStreakUpdate = await constructMaxStreakUpdate(
    userId,
    game.isWinner(userId),
    game.getStreak(userId),
    game.connectionMode,
    game.gameMode
  )

  const totalGamesUpdate = constructTotalGamesUpdate(
    game.connectionMode,
    game.gameMode,
    game.round,
    game.roundLimit
  )

  const totalWinsUpdate = constructTotalWinsUpdate(
    game.getRoundsWon(userId),
    game.connectionMode,
    game.gameMode,
    game.roundLimit
  )

  const totalSolveTimeUpdate = constructTotalSolveTimeUpdate(
    game.getTotalSolveTime(userId),
    game.connectionMode,
    game.gameMode,
    game.timer
  )

  const solveDistribution = await constructSolveDistributionUpdate(
    userId,
    game.connectionMode,
    game.gameMode,
    game.gameUserInfo
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
    !dbHasUpdated(userId, game.hasUpdatedInDbList) // TODO wont need this anymore because of the public/private update logic split
  ) {
    try {
      const userUpdate = await dbConstructUserUpdate(userId, game)
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
  if (game.winnerId && game.roomConnectionMode && game.gameMode) {
    // We could use a for loop to update each user in the db, but it would
    // be sequential. The following approach allows parallel execution.
    // .map() to create an array of Promises for each user update operation,
    // then Promise.all() to wait for all of them to complete.
    // NOTE: This parallel approach may actually *hinder* the db's performance
    // if our db doesn't handle multiprocessing well. Should test if possible.
    const userIds = game.getUserIds()
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
  dbCreateNewUser,
  dbGetUserById,
  dbGetUserByName,
  dbUpdateUser,
  dbBatchUpdateUsers,
  setDisplayName,
  handleDisplayNameUpdate,
  handleUserDisconnect,
  handleLeaveRoom,
}
