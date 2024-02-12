// Services
import {
  initializeRoom,
  isRoomInProgress,
  isRoomFull,
  resetCountdown,
  addUserToRoom,
  getRoomConnectionMode,
  hasCountdownStarted,
  setCountdownStarted,
  findMatchingRoom,
  isRoomChallengeMode,
  broadcastRoomUserInfo,
} from "../services/roomService.js"

// Default values
// const PRIVATE_ROOM_COUNTDOWN_TIMER = 6
// const PUBLIC_ROOM_COUNTDOWN_TIMER = 10

const PRIVATE_ROOM_COUNTDOWN_TIMER = 6
const PUBLIC_ROOM_COUNTDOWN_TIMER = 10

function createRoom(connectionMode, isChallengeOn, socket) {
  try {
    const roomId = initializeRoom(connectionMode, isChallengeOn, socket.userId)
    console.log(`Creating room: ${roomId}`)
    socket.emit("roomCreated", roomId)
  } catch (error) {
    console.error(`Error creating room: ${error.message}`)
    throw error
  }
}

// Contains logic to join room in progress, which only applies to private games
// Don't need extra logic for public games though because the matchmaking functions account for this
function joinRoom(roomId, displayName, io, socket) {
  try {
    if (!isRoomFull(roomId)) {
      console.log(`${socket.id} joining room: ${roomId}`)
      addUserToRoom(socket, displayName, roomId)
      broadcastRoomUserInfo(roomId, io)

      if (!isRoomInProgress(roomId)) {
        socket.emit(
          "roomJoined",
          getRoomConnectionMode(roomId),
          isRoomChallengeMode(roomId)
        )
      } else {
        socket.emit(
          "roomJoinedInProgress",
          getRoomConnectionMode(roomId),
          isRoomChallengeMode(roomId)
        )
      }
    } else {
      console.log(`${socket.id} failed to join room: ${roomId}`)
      socket.emit("roomFull")
    }
  } catch (error) {
    console.error(`Error joining room: ${error.message}`)
    throw error
  }
}

function handleCountdownStart(roomId, io) {
  if (!hasCountdownStarted(roomId)) {
    setCountdownStarted(roomId)
    io.to(roomId).emit("countdownStarted")
    let seconds
    const roomConnectionMode = getRoomConnectionMode(roomId)
    if (roomConnectionMode === "private") {
      seconds = PRIVATE_ROOM_COUNTDOWN_TIMER
    } else if (roomConnectionMode === "public") {
      seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
    } else {
      seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
    }

    io.to(roomId).emit("countdownTick", seconds)
    const countdownInterval = setInterval(() => {
      if (!hasCountdownStarted(roomId)) {
        clearInterval(countdownInterval)
        return
      }
      seconds--
      io.to(roomId).emit("countdownTick", seconds)

      if (seconds === 3) {
        clearInterval(countdownInterval)
        startRoom(roomId, io)
      }
    }, 1000)
  }
}

function handleCountdownStop(roomId) {
  if (hasCountdownStarted(roomId)) {
    resetCountdown(roomId)
  }
}

function handleMatchmaking(isChallengeOn, socket) {
  const matchingRoomId = findMatchingRoom(isChallengeOn)
  if (matchingRoomId) {
    socket.emit("matchFound", matchingRoomId)
  } else {
    socket.emit("noMatchesFound")
  }
}

function startRoom(roomId, io) {
  if (roomId) {
    io.to(roomId).emit("roomStarted")
  }
}

export {
  createRoom,
  joinRoom,
  handleCountdownStart,
  handleCountdownStop,
  handleMatchmaking,
}
