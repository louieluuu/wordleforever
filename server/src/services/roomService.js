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
  if (room && room instanceof Room && room.users.length > 0) {
    room.hostUserId = room.users[0]
    return room.hostUserId
  }
  return null
}

function isRoomEmpty(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.users.length === 0
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
    return room.users.length >= MAX_ROOM_SIZE
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
    room.loadedUsers.length >= room.users.length
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
    room.users = room.users.filter((user) => user !== userId)
  }
}

function getRoomUserInfo(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo
  }
  return []
}

function isUserInRoom(roomId, userId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.users.includes(userId)
  }
}

function findMatchingRoom(isChallengeOn) {
  const matchingRoomId = null
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
  // TODO this error checking is annoying
  let roomUserInfo
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    roomUserInfo = room.userInfo
  } else {
    roomUserInfo = new Map() // empty map
  }

  const roomUserInfoArray = Array.from(
    roomUserInfo.entries(),
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
