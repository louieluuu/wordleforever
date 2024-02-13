// Classes
import Game from "../classes/Game.js"

// Services
import {
  getRoomUserInfo,
  getRoomConnectionMode,
  getRoomGameMode,
  setRoomInProgress,
  setRoomInGame,
  roomInLobby,
  areAllUsersLoaded,
  loadUser,
} from "./roomService.js"

import { dbUpdateUser, dbBatchUpdateUsers } from "./userService.js"

const Games = new Map()

// For now games will be indexed by roomId and deleted when the room is deleted
// Possible new feature: store game info in DB for match history, in which case they'll need a new gameId
function initializeGameInfo(roomId) {
  // Should only be set for subsequent games in private games, games should be deleted upon room deletion
  let prevPoints = new Map()
  let prevRound = 0
  let prevRoundsWon = new Map()
  let prevRoundsSolved = new Map()
  let prevTotalGuesses = new Map()
  let prevTotalSolveTime = new Map()
  if (Games.has(roomId)) {
    const prevGame = Games.get(roomId)
    if (!prevGame.reachedRoundLimit) {
      prevPoints = prevGame.getAllPoints()
      prevRound = prevGame.round
      prevRoundsWon = prevGame.getAllRoundsWon()
      prevRoundsSolved = prevGame.getAllRoundsSolved()
      prevTotalGuesses = prevGame.getAllTotalGuesses()
      prevTotalSolveTime = prevGame.getAllTotalSolveTime()
      deleteGame(roomId)
    } else {
      deleteGame(roomId)
    }
  }
  const game = Game.createGame(
    getRoomConnectionMode(roomId),
    getRoomGameMode(roomId),
    getRoomUserInfo(roomId),
    prevPoints,
    prevRound,
    prevRoundsWon,
    prevRoundsSolved,
    prevTotalGuesses,
    prevTotalSolveTime
  )
  Games.set(roomId, game)
}

// TODO TODAY: This should be a Game class method, not here
function getUserIdsInGame(roomId) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    return game.getUserIds()
  }
  return []
}

// Maybe eventually store games in a DB instead for match history info, for now they are deleted upon completion
function deleteGame(roomId) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    console.log(`Deleting game: ${roomId}`)
    game.cleanupTimer()
    Games.delete(roomId)
  }
}

function handleGameStart(roomId, io) {
  try {
    if (roomId && roomInLobby(roomId)) {
      setRoomInProgress(roomId)
      setRoomInGame(roomId)
      initializeGameInfo(roomId)
      const game = Games.get(roomId)
      if (game && game instanceof Game) {
        game.startGame(roomId, io)
      }
    } else {
      console.error("Invalid roomId for starting game")
    }
  } catch (error) {
    console.error("Error starting game:", error)
  }
}

function handleLoadUser(roomId, userId, io) {
  if (userId) {
    loadUser(userId, roomId)
  }
  if (areAllUsersLoaded(roomId)) {
    handleGameStart(roomId, io)
  }
}

function handleGameJoinedInProgress(roomId, socket) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    game.broadcastSpectatorInfo(socket)
  }
}

function handleWrongGuess(roomId, userId, updatedGameBoard, io) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    game.setGameBoard(userId, updatedGameBoard)
    game.broadcastGameBoard(roomId, userId, io)
    game.incrementTotalGuesses(userId)
  }
}

// POST- TODO: I don't think this is true lol
// TODO: do not batch update for public games, individually update
// the format of public games demands it (not everyone finishes at the same time, it's weird to pigeonhole it into a batch update)
async function handleCorrectGuess(
  roomId,
  userId,
  updatedGameBoard,
  socket,
  io
) {
  try {
    const roomConnectionMode = getRoomConnectionMode(roomId)
    const game = Games.get(roomId)

    if (roomConnectionMode && game && game instanceof Game) {
      if (roomConnectionMode === "private") {
        game.updatePoints(userId)
        game.broadcastPoints(roomId, userId, io)
      } else if (roomConnectionMode === "public") {
        game.updateStreaks(userId)
      }
      // Applies to both
      if (game.countSolved === 0) {
        game.broadcastFirstSolve(roomId, userId, io)
      }
      game.setWinner(userId)
      game.countSolved += 1

      game.incrementTotalGuesses(userId)
      // We want both totalGuesses for private room stats, as well as a guessDistribution for proper stats dialog. Means we need to add a currentGuess number counter.
      // TODO: game.updateGuessDistribution(userId)
      game.incrementRoundsSolved(userId)
      game.incrementTotalSolveTime(userId)

      game.broadcastSolvedAudio(roomId, socket)
      game.setGameBoard(userId, updatedGameBoard)

      if (game.isGameOver()) {
        game.endGame(roomId, io)
        if (game.isMatchOver()) {
          dbBatchUpdateUsers(game)
        }
      } else {
        game.broadcastGameBoard(roomId, userId, io)
        // Pretty hacky, maybe a better way to do this. This needs to be separate from game.broadcastFirstSolve above, as that needs to be emitted regardless of if the game is over or not, we only want to set the timer when the game isn't over. But the game over logic depends on game.countSolved being incremented first, and this needs to come after the game over logic, thus this is "technically" checking for first solve logic, but we need to check for a game.countSolved of 1 instead of 0
        if (game.countSolved === 1) {
          game.setSolvedTimer(roomId, io)
        }
      }
    }
  } catch (error) {
    console.error(`Error handling correct guess: ${error.message}`)
    throw error
  }
}

async function handleOutOfGuesses(roomId, userId, io) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    if (game.connectionMode === "public") {
      game.resetStreak(userId)
      game.broadcastStreak(roomId, userId, io)
      // In the public outOfGuesses case, db must be updated
      // immediately; can't wait for batch update
      await dbUpdateUser(userId, game)
      game.hasUpdatedInDbList.push(userId)
    }
    // TODO: Concerned about the ordering of this, since it comes
    // after a potentially slow db update and other logic might
    // depend on the countOutOfGuesses? Maybe it's fine.
    game.countOutOfGuesses += 1
    if (game.isGameOver()) {
      game.endGame(roomId, io)
      if (game.isMatchOver()) {
        // If it's a public game, and everyone gets out of guesses (which is the only way this condition would be reached), then the db has already updated everyone individually above. Only need to handle the private case.
        if (game.connectionMode === "private") {
          dbBatchUpdateUsers(game)
        }
      }
    }
  }
}

function handleBatchDbUpdate(game) {
  dbBatchUpdateUsers(game)
}

export {
  getUserIdsInGame,
  deleteGame,
  handleGameStart,
  handleLoadUser,
  handleWrongGuess,
  handleCorrectGuess,
  handleOutOfGuesses,
  handleGameJoinedInProgress,
  handleBatchDbUpdate,
}
