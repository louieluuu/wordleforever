// Classes
import Game from "../classes/Game.js"

// Services
import {
  getRoomConfiguration,
  getRoomUserInfo,
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
  let prevRound = 0
  let prevGameUserInfo = new Map()
  if (Games.has(roomId)) {
    const prevGame = Games.get(roomId)
    if (!prevGame.reachedRoundLimit) {
      prevRound = prevGame.round
      prevGameUserInfo = prevGame.gameUserInfo
      deleteGame(roomId)
    } else {
      deleteGame(roomId)
    }
  }
  const game = Game.createGame(
    getRoomConfiguration(roomId),
    getRoomUserInfo(roomId),
    prevRound,
    prevGameUserInfo
  )
  Games.set(roomId, game)
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
    loadUser(socket.userId, roomId)
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

async function handleCorrectGuess(
  roomId,
  userId,
  updatedGameBoard,
  correctGuessIndex,
  socket,
  io
) {
  try {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
      // Game logic first
      game.setGameBoard(userId, updatedGameBoard)
      game.setWinner(userId)
      game.countSolved += 1
      game.broadcastSolvedAudio(roomId, socket)
      if (game.countSolved === 1) {
        game.incrementRoundsWon(userId)
        game.broadcastFirstSolve(roomId, userId, io)
      }

      // Update stats
      // Public game logic - everyone can continue to solve the word, but streaks should only be updated once (on the first solve)
      if (game.connectionMode === "public" && game.countSolved === 1) {
        game.updateStreaks(userId)
        game.broadcastStreak(roomId, userId, io)
      } else if (game.connectionMode === "private") {
        game.updatePoints(userId)
        game.broadcastPoints(roomId, userId, io)
      }
      game.updateSolveDistribution(userId, correctGuessIndex)
      game.incrementTotalSolveTime(userId)
      game.incrementTotalGuesses(userId)

      if (game.connectionMode === "public") {
        dbUpdateUser(userId, game)
      }

      // Game progression
      if (game.isGameOver()) {
        game.endGame(roomId, io)
        if (game.connectionMode === "private" && game.isMatchOver()) {
          dbBatchUpdateUsers(game)
        }
      } else {
        game.broadcastGameBoard(roomId, userId, io)
        // Pretty hacky, maybe a better way to do this. This needs to be separate from game.broadcastFirstSolve above, as that needs to be emitted regardless of if the game is over or not, we only want to set the timer when the game isn't over. But the game over logic depends on game.countSolved being incremented first, and this needs to come after the game over logic, thus this is "technically" checking for first solve logic, but we need to check for a game.countSolved of 1 instead of 0

        // Example: 2-person private game, first person goes OOG, second person solves:
        // in this case, we don't want setSolvedTimer to run
        if (
          game.connectionMode === "private" &&
          game.countSolved === 1 &&
          game.isDynamicTimerOn
        ) {
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
    game.incrementTotalOutOfGuesses(userId)
    game.countOutOfGuesses += 1

    if (game.connectionMode === "public") {
      game.resetStreak(userId)
      game.broadcastStreak(roomId, userId, io)
      await dbUpdateUser(userId, game)
    }
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
  deleteGame,
  handleGameStart,
  handleLoadUser,
  handleWrongGuess,
  handleCorrectGuess,
  handleOutOfGuesses,
  handleGameJoinedInProgress,
  handleBatchDbUpdate,
}
