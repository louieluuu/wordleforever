import { get, merge } from "lodash-es"
const _ = { get, merge }

// Database models
import User from "../database/User.js"
// Classes
import Game from "../classes/Game.js"

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

  console.log(`A new user connected with socket.userId: ${socket.userId}`)
}

function dbIsRegistered(userId) {
  // userId can either be exactly 20 chars (default socket.id length; cannot be a user),
  // or 28+ chars (Firebase uid length; must be a user).
  if (userId) {
    return userId.length >= MIN_FIREBASE_UID_LENGTH ? true : false
  }
  return false
}

async function dbCheckExistingUsername(username) {
  if (username) {
    const usernameExists = await User.exists({ username: username })
    return usernameExists
  }
}

async function dbCreateNewUser(userId, username) {
  if (userId && username) {
    try {
      // Just in case...
      const userIdExists = await User.exists({ _id: userId })
      if (!userIdExists) {
        await User.create({
          _id: userId,
          username: username,
        })
        console.log(`New user created with userId: ${userId}`)
      }
    } catch (error) {
      console.error(
        `Error initializing user info in the database: ${error.message}`
      )
      throw error
    }
  }
}

async function dbGetUserById(userId, connectionMode, gameMode) {
  if (!dbIsRegistered(userId)) {
    return null
  }
  try {
    const statsPath = `stats.${connectionMode}.${gameMode}`
    const statsDoc = await User.findById(userId, `${statsPath} -_id`).lean()
    const stats = _.get(statsDoc, statsPath)
    return stats
  } catch (error) {
    console.error(
      `Error getting user stats from the database: ${error.message}`
    )
    throw error
  }
}

async function dbGetUserByUsername(username) {
  if (username) {
    try {
      // Case-insensitive search
      const user = await User.findOne(
        {
          username: { $regex: new RegExp(`^${username}$`, "i") },
        },
        "-_id -__v -username"
      ).lean()

      return user
    } catch (error) {
      console.error(
        `Error getting user info from the database: ${error.message}`
      )
      throw error
    }
  }
}

async function dbGetCurrStreak(userId, gameMode) {
  if (!dbIsRegistered(userId)) {
    return 0
  }
  const currStreakPath = `stats.public.${gameMode}.currStreak`
  try {
    const currStreakDoc = await User.findById(
      userId,
      `${currStreakPath} -_id`
    ).lean()

    const currStreak = _.get(currStreakDoc, currStreakPath)
    if (typeof currStreak === "number") {
      return currStreak
    } else {
      return 0
    }
  } catch (error) {
    console.error(
      `Error getting user streak from the database: ${error.message}`
    )
    throw error
  }
}

function constructCurrStreakUpdate(isWinner, connectionMode, gameMode) {
  let update = {}

  if (connectionMode === "public") {
    const currStreakPath = `stats.public.${gameMode}.currStreak`
    if (isWinner) {
      update = { $inc: { [currStreakPath]: 1 } }
    } else {
      update = { $set: { [currStreakPath]: 0 } }
    }
  }

  return update
}

async function constructBestStreakUpdate(
  userId,
  isWinner,
  currStreak,
  connectionMode,
  gameMode
) {
  let update = {}

  if (connectionMode === "public" && isWinner) {
    // Read the current bestStreak from db.
    const bestStreakPath = `stats.public.${gameMode}.bestStreak`
    const bestStreakDoc = await User.findById(
      userId,
      `${bestStreakPath} -_id`
    ).lean()
    const bestStreak = _.get(bestStreakDoc, bestStreakPath)

    // Compare and update if necessary.
    if (typeof currStreak === "number" && typeof bestStreak === "number") {
      if (currStreak > bestStreak) {
        update = { $set: { [bestStreakPath]: currStreak } }
      }
    }
  }

  return update
}

async function constructTotalCrownsUpdate(
  userId,
  matchWinnerId,
  connectionMode,
  gameMode
) {
  let update = {}

  if (connectionMode === "private" && userId === matchWinnerId) {
    const totalCrownsPath = `stats.private.${gameMode}.totalCrowns`
    update = { $inc: { [totalCrownsPath]: 1 } }
  }

  return update
}

async function constructTotalMatchesUpdate(connectionMode, gameMode) {
  let update = {}

  if (connectionMode === "private") {
    const totalMatchesPath = `stats.private.${gameMode}.totalMatches`
    update = { $inc: { [totalMatchesPath]: 1 } }
  }

  return update
}

function constructTotalGamesUpdate(
  roundsPlayed,
  roundLimit,
  connectionMode,
  gameMode
) {
  let update = {}

  if (typeof roundsPlayed === "number") {
    if (roundsPlayed > 0 && roundsPlayed <= roundLimit) {
      const totalGamesPath = `stats.${connectionMode}.${gameMode}.totalGames`
      update = { $inc: { [totalGamesPath]: roundsPlayed } }
    }
  }

  return update
}

function constructTotalWinsUpdate(
  roundsWon,
  roundLimit,
  connectionMode,
  gameMode
) {
  let update = {}

  if (typeof roundsWon === "number") {
    if (roundsWon > 0 && roundsWon <= roundLimit) {
      const totalWinsPath = `stats.${connectionMode}.${gameMode}.totalWins`
      update = { $inc: { [totalWinsPath]: roundsWon } }
    }
  }

  return update
}

async function constructSolveDistributionUpdate(
  userId,
  solveDistribution,
  connectionMode,
  gameMode
) {
  let update = {}

  if (typeof solveDistribution === "object") {
    const isSameDistribution = solveDistribution.every((value) => value === 0)
    if (!isSameDistribution) {
      // Retrieve the old solveDistribution from db.
      const solveDistributionPath = `stats.${connectionMode}.${gameMode}.solveDistribution`
      const solveDistributionDoc = await User.findById(
        userId,
        `${solveDistributionPath} -_id`
      ).lean()
      const prevSolveDistribution = _.get(
        solveDistributionDoc,
        solveDistributionPath
      )

      // Add the new values via mapping.
      const updatedSolveDistribution = prevSolveDistribution.map(
        (value, index) => {
          return value + solveDistribution[index]
        }
      )

      update = { $set: { [solveDistributionPath]: updatedSolveDistribution } }
    }
  }

  return update
}

function constructTotalSolveTimeUpdate(
  totalSolveTime,
  connectionMode,
  gameMode
) {
  let update = {}

  if (typeof totalSolveTime === "number") {
    if (totalSolveTime > 0) {
      const totalSolveTimePath = `stats.${connectionMode}.${gameMode}.totalSolveTime`
      update = { $inc: { [totalSolveTimePath]: totalSolveTime } }
    }
  }

  return update
}

function constructTotalGuessesUpdate(totalGuesses, connectionMode, gameMode) {
  let update = {}

  if (typeof totalGuesses === "number") {
    if (totalGuesses > 0) {
      const totalGuessesPath = `stats.${connectionMode}.${gameMode}.totalGuesses`
      update = { $inc: { [totalGuessesPath]: totalGuesses } }
    }
  }

  return update
}

function constructTotalOutOfGuessesUpdate(
  totalOutOfGuesses,
  connectionMode,
  gameMode
) {
  let update = {}

  if (typeof totalOutOfGuesses === "number") {
    if (totalOutOfGuesses > 0) {
      const totalOutOfGuessesPath = `stats.${connectionMode}.${gameMode}.totalOOG`
      update = { $inc: { [totalOutOfGuessesPath]: totalOutOfGuesses } }
    }
  }

  return update
}

async function dbConstructUserUpdate(userId, game) {
  const currStreakUpdate = constructCurrStreakUpdate(
    game.isWinner(userId),
    game.connectionMode,
    game.gameMode
  )

  const bestStreakUpdate = await constructBestStreakUpdate(
    userId,
    game.isWinner(userId),
    game.getStreak(userId),
    game.connectionMode,
    game.gameMode
  )

  const totalCrownsUpdate = await constructTotalCrownsUpdate(
    userId,
    game.getMatchWinnerId(),
    game.connectionMode,
    game.gameMode
  )

  const totalMatchesUpdate = await constructTotalMatchesUpdate(
    game.connectionMode,
    game.gameMode
  )

  const totalGamesUpdate = constructTotalGamesUpdate(
    game.getRoundsPlayed(userId),
    game.roundLimit,
    game.connectionMode,
    game.gameMode
  )

  const totalWinsUpdate = constructTotalWinsUpdate(
    game.getRoundsWon(userId),
    game.roundLimit,
    game.connectionMode,
    game.gameMode
  )

  const solveDistribution = await constructSolveDistributionUpdate(
    userId,
    game.getSolveDistribution(userId),
    game.connectionMode,
    game.gameMode
  )

  const totalSolveTimeUpdate = constructTotalSolveTimeUpdate(
    game.getTotalSolveTime(userId),
    game.connectionMode,
    game.gameMode
  )

  const totalGuessesUpdate = constructTotalGuessesUpdate(
    game.getTotalGuesses(userId),
    game.connectionMode,
    game.gameMode
  )

  const totalOutOfGuessesUpdate = constructTotalOutOfGuessesUpdate(
    game.getTotalOutOfGuesses(userId),
    game.connectionMode,
    game.gameMode
  )

  // With _.merge, multiple $inc operations will be aggregated instead of overwritten.
  const userUpdate = _.merge(
    currStreakUpdate,
    bestStreakUpdate,
    totalCrownsUpdate,
    totalMatchesUpdate,
    totalGamesUpdate,
    totalWinsUpdate,
    solveDistribution,
    totalSolveTimeUpdate,
    totalGuessesUpdate,
    totalOutOfGuessesUpdate
  )

  return userUpdate
}

async function dbUpdateUser(userId, game) {
  if (dbIsRegistered(userId)) {
    try {
      const userUpdate = await dbConstructUserUpdate(userId, game)
      console.log(
        `dbConstructUserUpdate returns: ${JSON.stringify(userUpdate)}`
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
  console.log(`game.winnerId: ${game.winnerId}`)
  console.log(`game.connectionMode: ${game.connectionMode}`)
  console.log(`game.gameMode: ${game.gameMode}`)

  if (game && game instanceof Game) {
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

export {
  handleNewConnection,
  dbCheckExistingUsername,
  dbCreateNewUser,
  dbGetUserById,
  dbGetUserByUsername,
  dbGetCurrStreak,
  dbUpdateUser,
  dbBatchUpdateUsers,
}
