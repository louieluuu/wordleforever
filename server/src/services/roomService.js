import { v4 as uuidv4 } from "uuid"

// Classes
import Room from "../classes/Room.js"

// Services
import { dbGetCurrStreak } from "./userService.js"
import { deleteGame } from "./gameService.js"

const Rooms = new Map()

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

function getRoomRoundLimit(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.roundLimit
  }
  return 0
}

function getRoomRoundTime(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.roundTime
  }
  return 0
}

function getDynamicTimerOn(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.dynamicTimerOn
  }
  return true
}

function getLetterEliminationOn(roomId) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    return room.letterEliminationOn
  }
  return true
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
    return room.userInfo.size >= room.maxPlayers
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

async function addUserToRoom(roomId, displayName, socket) {
  socket.roomId = roomId
  socket.join(roomId)

  console.log(`${socket.userId} joining room: ${roomId}`)

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

function handleUpdateMaxPlayers(socket, roomId, newMaxPlayers) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.maxPlayers = newMaxPlayers
    socket.to(roomId).emit("maxPlayersUpdated", newMaxPlayers)
  }
}

function handleUpdateRoundLimit(socket, roomId, newRoundLimit) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.roundLimit = newRoundLimit
    socket.to(roomId).emit("roundLimitUpdated", newRoundLimit)
  }
}

function handleUpdateRoundTime(socket, roomId, newRoundTime) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.roundTime = newRoundTime
    socket.to(roomId).emit("roundTimeUpdated", newRoundTime)
  }
}

function handleUpdateDynamicTimerOn(socket, roomId, newDynamicTimer) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.dynamicTimerOn = newDynamicTimer
    socket.to(roomId).emit("dynamicTimerUpdated", newDynamicTimer)
  }
}

function handleUpdateLetterEliminationOn(socket, roomId, newLetterElimination) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.letterEliminationOn = newLetterElimination
    socket.to(roomId).emit("letterEliminationUpdated", newLetterElimination)
  }
}

function handleUpdateGameMode(socket, roomId, newGameMode) {
  const room = Rooms.get(roomId)
  if (room && room instanceof Room) {
    room.gameMode = newGameMode
    socket.to(roomId).emit("gameModeUpdated", newGameMode)
  }
}

function handleUserDisconnect(socket, io) {
  console.log(`A user disconnected with socket.userId: ${socket.userId}`)
  handleLeaveRoom(socket, io)
}

function handleLeaveRoom(socket, io) {
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

function handleKickUser(userId, roomId, io) {
  removeUserFromRoom(userId, roomId)
  broadcastRoomUserInfo(roomId, io)
}

export {
  initializeRoom,
  getRoom,
  deleteRoom,
  getRoomConnectionMode,
  getRoomGameMode,
  getRoomRoundLimit,
  getRoomRoundTime,
  getDynamicTimerOn,
  getLetterEliminationOn,
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
  handleUpdateMaxPlayers,
  handleUpdateRoundLimit,
  handleUpdateRoundTime,
  handleUpdateGameMode,
  handleUpdateDynamicTimerOn,
  handleUpdateLetterEliminationOn,
  handleUserDisconnect,
  handleLeaveRoom,
  handleKickUser,
}
