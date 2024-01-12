// Classes
import Game from "../classes/Game.js"

// Services
import {
  isRoomChallengeMode,
  getUsersInRoom,
  getRoomConnectionMode,
  setRoomInProgress,
  setRoomInGame,
  setRoomOutOfGame,
  roomInLobby,
} from "./roomService.js"
import {
  handleUserStreakUpdates,
  handleUserStreakReset,
} from "./userService.js"

const Games = new Map()

// For now games will be indexed by roomId and deleted when the room is deleted
// Possible new feature: store game info in DB for match history, in which case they'll need a new gameId
async function initializeGameInfo(roomId) {
  // Should only be set for subsequent games in private games, games should be deleted upon room deletion
  let prevPoints = new Map()
  let prevRound = 0
  if (Games.has(roomId)) {
    prevPoints = Games.get(roomId).getAllPoints()
    prevRound = Games.get(roomId).round
    deleteGame(roomId)
  }
  const game = await Game.createGame(
    getUsersInRoom(roomId),
    prevPoints,
    prevRound,
    isRoomChallengeMode(roomId)
  )
  Games.set(roomId, game)
}

// Maybe eventually store games in a DB instead for match history info, for now they are deleted upon completion
function deleteGame(roomId) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    console.log(`Deleting game: ${roomId}`)
    Games.delete(roomId)
  }
}

async function handleGameStart(roomId, io) {
  try {
    if (roomId && roomInLobby(roomId)) {
      setRoomInProgress(roomId)
      setRoomInGame(roomId)
      await initializeGameInfo(roomId)
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
  }
}

async function handleCorrectGuess(
  roomId,
  userId,
  updatedGameBoard,
  socket,
  io
) {
  try {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
      if (getRoomConnectionMode(roomId) === "online-private") {
        game.updatePoints(userId)
        game.broadcastPoints(roomId, userId, io)
        if (game.countSolved === 0) {
          socket.emit("firstSolve")
        }
      } else if (getRoomConnectionMode(roomId) === "online-public") {
        game.updateStreaks(userId)
        await handleUserStreakUpdates(userId, roomId)
      }
      game.countSolved += 1
      game.setGameBoard(userId, updatedGameBoard)
      if (isGameOver(roomId, io)) {
        game.broadcastFinalUserInfo(roomId, io)
      } else {
        game.broadcastGameBoard(roomId, userId, io)
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
      await handleUserStreakReset(userId, roomId)
      game.broadcastStreak(roomId, userId, io)
    }
    game.countOutOfGuesses += 1
    if (isGameOver(roomId, io)) {
      game.broadcastFinalUserInfo(roomId, io)
    }
  }
}

function isGameOver(roomId, io) {
  const game = Games.get(roomId)
  if (game && game instanceof Game) {
    if (getRoomConnectionMode(roomId) === "online-private") {
      if (game.countSolved + game.countOutOfGuesses >= game.roomSize()) {
        setRoomOutOfGame(roomId)
        return true
      }
    } else if (getRoomConnectionMode(roomId) === "online-public") {
      if (game.countSolved > 0 || game.countOutOfGuesses >= game.roomSize()) {
        return true
      }
    }
  }
  return false
}

export {
  deleteGame,
  handleGameStart,
  handleWrongGuess,
  handleCorrectGuess,
  handleOutOfGuesses,
  handleGameJoinedInProgress,
}
