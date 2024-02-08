import { v4 as uuidv4 } from "uuid"

// Classes
import Room from "../classes/Room.js"

// Services
import {} from "./userService.js"
import { deleteGame } from "./gameService.js"

const Rooms = new Map()

const MAX_ROOM_SIZE = 7

function initializeRoom(connectionMode, isChallengeOn, userId) {
  let uuid = uuidv4()
  let roomId = uuid.substring(0, 8)
  // Non-colliding rooms
  while (Rooms.has(roomId)) {
    uuid = uuidv4()
    roomId = uuid.substring(0, 8)
  }
  const room = new Room(connectionMode, isChallengeOn, userId)
  Rooms.set(roomId, room)
  return roomId
}

function getRoom(roomId) {
  const room = Rooms.get(roomId)
  return room ? room : null
}

function deleteRoom(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    console.log(`Deleting room: ${roomId}`)
    Rooms.delete(roomId)
    deleteGame(roomId)
  }
}

function getRoomConnectionMode(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.connectionMode
  }
  return null
}

function isRoomChallengeMode(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.isChallengeOn
  }
  return false
}

function isUserHostInRoom(roomId, userId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    if (userId === room.hostUserId) {
      return true
    }
  }
  return false
}

function generateNewHostInRoom(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room && room.userInfo.size > 0) {
    const firstUserId = room.userInfo.keys().next().value
    room.hostUserId = firstUserId
    return room.hostUserId
  }
  return null
}

function isRoomEmpty(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo.size === 0
  }
  return true
}

function setRoomInGame(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.inGame = true
  }
}

function setRoomOutOfGame(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.inGame = false
  }
}

function roomInLobby(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return !room.inGame
  }
  return false
}

function isRoomInProgress(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.inProgress
  }
  return false
}

function setRoomInProgress(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.inProgress = true
  }
}

function isRoomFull(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo.size >= MAX_ROOM_SIZE
  }
  return false
}

function hasCountdownStarted(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.countdownStarted
  }
  return false
}

function setCountdownStarted(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.countdownStarted = true
  }
}

function resetCountdown(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.countdownStarted = false
  }
}

function loadUser(userId, roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room && !room.loadedUsers.includes(userId)) {
    room.loadedUsers.push(userId)
  }
}

function areAllUsersLoaded(roomId) {
  const room = Rooms.get(roomId)
  if (
    room &&
    room instanceof Room &&
    room.loadedUsers.length >= room.userInfo.size
  ) {
    return true
  }
  return false
}

function addUserToRoom(socket, displayName, roomId) {
  // Attaching custom roomId property to socket.
  socket.join(roomId)
  socket.roomId = roomId

  const userObject = { displayName: displayName, streak: 0 } // TODO actual streak mia

  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.userInfo.set(socket.userId, userObject)
  }
}

function removeUserFromRoom(userId, roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.userInfo.delete(userId)
  }
}

// TODO: Consider a getRoomUserInfoArray function so the ugly .entries() syntax etc is not repeated
function getRoomUserInfo(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo
  }
  return new Map() // empty map
}

function isUserInRoom(roomId, userId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo.has(userId)
  }
}

function findMatchingRoom(isChallengeOn) {
  let matchingRoomId
  Rooms.forEach((room, roomId) => {
    if (
      room.connectionMode === "online-public" &&
      room.isChallengeOn === isChallengeOn &&
      !room.inGame
    ) {
      matchingRoomId = roomId
    }
  })
  return matchingRoomId
}

function broadcastRoomUserInfo(roomId, io) {
  const roomUserInfoMap = getRoomUserInfo(roomId)

  const roomUserInfoArray = Array.from(
    roomUserInfoMap.entries(),
    ([userId, userObj]) => ({
      userId: userId,
      displayName: userObj.displayName,
      streak: userObj.streak,
    })
  )
  io.to(roomId).emit("roomUserInfoUpdated", roomUserInfoArray)
}

export {
  initializeRoom,
  getRoom,
  deleteRoom,
  getRoomConnectionMode,
  isRoomChallengeMode,
  isUserHostInRoom,
  generateNewHostInRoom,
  isRoomEmpty,
  setRoomInGame,
  setRoomOutOfGame,
  roomInLobby,
  isRoomInProgress,
  setRoomInProgress,
  isRoomFull,
  hasCountdownStarted,
  setCountdownStarted,
  resetCountdown,
  loadUser,
  areAllUsersLoaded,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUserInfo,
  isUserInRoom,
  findMatchingRoom,
  broadcastRoomUserInfo,
}
