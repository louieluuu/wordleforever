// Classes
import Game from "../classes/Game.js"

// Services
import {
  getRoomUserInfo,
  isRoomChallengeMode,
  getRoomConnectionMode,
  setRoomInProgress,
  setRoomInGame,
  roomInLobby,
  areAllUsersLoaded,
  loadUser,
} from "./roomService.js"
import {
  handleUserStreakUpdates,
  handleUserStreakReset,
} from "./userService.js"

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
    getRoomUserInfo(roomId),
    prevPoints,
    prevRound,
    prevRoundsWon,
    prevRoundsSolved,
    prevTotalGuesses,
    prevTotalSolveTime,
    isRoomChallengeMode(roomId)
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

// TODO one of the rare functions that actually require async
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
      if (roomConnectionMode === "online-private") {
        if (game.countSolved === 0) {
          game.broadcastFirstSolve(roomId, userId, io)
        }
        game.updatePoints(userId)
        game.broadcastPoints(roomId, userId, io)
        game.incrementTotalGuesses(userId)
        game.incrementRoundsSolved(userId)
        game.incrementTotalSolveTime(userId)
      } else if (roomConnectionMode === "online-public") {
        game.updateStreaks(userId)
        await handleUserStreakUpdates(userId, roomId) // TODO
      }

      game.countSolved += 1
      game.broadcastSolvedAudio(roomId, socket)
      game.setGameBoard(userId, updatedGameBoard)
      if (isGameOver(roomId, roomConnectionMode)) {
        game.endGame(roomId, io)
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
    if (getRoomConnectionMode(roomId) === "online-public") {
      game.resetStreak(userId)
      await handleUserStreakReset(userId, roomId) // TODO streak
      game.broadcastStreak(roomId, userId, io)
    }
    game.countOutOfGuesses += 1
    if (isGameOver(roomId)) {
      game.endGame(roomId, io)
    }
  }
}

function isGameOver(roomId, roomConnectionMode) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    if (roomConnectionMode === "online-private") {
      if (game.countSolved + game.countOutOfGuesses >= game.getRoomSize()) {
        return true
      }
    } else if (roomConnectionMode === "online-public") {
      if (
        game.countSolved > 0 ||
        game.countOutOfGuesses >= game.getRoomSize()
      ) {
        return true
      }
    }
  }
  return false
}

export {
  deleteGame,
  handleGameStart,
  handleLoadUser,
  handleWrongGuess,
  handleCorrectGuess,
  handleOutOfGuesses,
  handleGameJoinedInProgress,
}
