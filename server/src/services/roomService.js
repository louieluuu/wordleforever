import { v4 as uuidv4 } from "uuid"

// Classes
import Room from "../classes/Room.js"

// Services
import { dbGetCurrStreak } from "./userService.js"
import { deleteGame } from "./gameService.js"

const Rooms = new Map()

const MAX_ROOM_SIZE = 7

function initializeRoom(connectionMode, gameMode, userId) {
  let uuid = uuidv4()
  let roomId = uuid.substring(0, 8)
  // Non-colliding rooms
  while (Rooms.has(roomId)) {
    uuid = uuidv4()
    roomId = uuid.substring(0, 8)
  }
  const room = new Room(connectionMode, gameMode, userId)
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

function getRoomGameMode(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.gameMode
  }
  return null
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

function isHostLeaving(roomId, userId) {
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

async function addUserToRoom(socket, displayName, roomId) {
  // TODO
  // Attaching custom properties to socket.
  // Handles the bug case where users join by pasting a link,
  // but feels awfully hacky.
  socket.join(roomId)
  socket.userId = socket.userId || socket.id
  socket.roomId = roomId

  const currStreak = await dbGetCurrStreak(
    socket.userId,
    getRoomGameMode(roomId)
  )

  const userObject = {
    displayName: displayName,
    currStreak: currStreak,
    isReady: false,
  }

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

function userReadyUp(roomId, userId) {
  const roomUserInfo = getRoomUserInfo(roomId)
  if (roomUserInfo) {
    const previousValue = roomUserInfo.get(userId)
    roomUserInfo.set(userId, {
      ...previousValue,
      isReady: true,
    })
  }
}

function userUnreadyUp(roomId, userId) {
  const roomUserInfo = getRoomUserInfo(roomId)
  if (roomUserInfo) {
    const previousValue = roomUserInfo.get(userId)
    roomUserInfo.set(userId, {
      ...previousValue,
      isReady: false,
    })
  }
}

function handleUserReadyUp(roomId, userId, io) {
  userReadyUp(roomId, userId)
  broadcastRoomUserInfo(roomId, io)
}

function handleUserUnreadyUp(roomId, userId, io) {
  userUnreadyUp(roomId, userId)
  broadcastRoomUserInfo(roomId, io)
}

function getRoomUserInfo(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo
  }
  return new Map() // empty map
}

function getRoomUserInfoAsArray(roomId) {
  const roomUserInfoMap = getRoomUserInfo(roomId)

  return Array.from(roomUserInfoMap.entries()).map(([userId, userInfo]) => {
    const userInfoEntry = { userId }

    for (const [key, value] of Object.entries(userInfo)) {
      userInfoEntry[key] = value
    }

    return userInfoEntry
  })
}

function isUserInRoom(roomId, userId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.userInfo.has(userId)
  }
}

function findMatchingRoom(gameMode) {
  let matchingRoomId = null

  for (let [roomId, roomObj] of Rooms.entries()) {
    if (
      roomObj.connectionMode === "public" &&
      roomObj.gameMode === gameMode &&
      !roomObj.inGame
    ) {
      matchingRoomId = roomId
      break
    }
  }

  return matchingRoomId
}

function broadcastRoomUserInfo(roomId, io) {
  const roomUserInfoArray = getRoomUserInfoAsArray(roomId)
  if (roomUserInfoArray) {
    io.to(roomId).emit("roomUserInfoUpdated", roomUserInfoArray)
  }
}

export {
  initializeRoom,
  getRoom,
  deleteRoom,
  getRoomConnectionMode,
  getRoomGameMode,
  handleDisplayNameUpdate,
  isHostLeaving,
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
  handleUserReadyUp,
  handleUserUnreadyUp,
  isUserInRoom,
  findMatchingRoom,
  broadcastRoomUserInfo,
}
