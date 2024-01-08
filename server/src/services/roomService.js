import { v4 as uuidv4 } from 'uuid'

// Classes
import Room from '../classes/Room.js'

// Services
import { getUser } from './userService.js'
import { deleteGame } from './gameService.js'

const Rooms = new Map()

const MAX_ROOM_SIZE = 4

function initializeRoom(connectionMode, gameMode) {
    let roomId = uuidv4()
    // Non-colliding rooms
    while (Rooms.has(roomId)) {
        roomId = uuidv4()
    }
    const room = new Room(connectionMode, gameMode)
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

function isRoomChallengeMode(roomId) {
    const room = Rooms.get(roomId)
    if (room && room instanceof Room) {
        return room.gameMode === 'Challenge'
    }
    return false
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

function isRoomFull(roomId) {
    const room = Rooms.get(roomId)
    if (room && room instanceof Room) {
        room.users.length >= MAX_ROOM_SIZE
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

async function addUserToRoom(userId, roomId) {
    try {
        const user = await getUser(userId)
        if (!user) {
            throw new Error(`User with ID ${userId} not found`)
        } else {
            const room = Rooms.get(roomId)
            if (room && room instanceof Room) {
                room.users.push(userId)
            }
        }
    } catch (error) {
        console.error(`Error adding user to room: ${error.message}`)
        throw error
    }
}

function removeUserFromRoom(userId, roomId) {
    const room = Rooms.get(roomId)
    if (room && room instanceof Room) {
        room.users = room.users.filter(user => user !== userId)
    }
}

function getUsersInRoom(roomId) {
    const room = Rooms.get(roomId)
    if (room && room instanceof Room) {
        return room.users
    }
}

function isUserInRoom(roomId, userId) {
    const room = Rooms.get(roomId)
    if (room && room instanceof Room) {
        return room.users.includes(userId)
    }
}

function findMatchingRoom(gameMode) {
    let matchingRoomId
    Rooms.forEach((room, roomId) => {
        if (room.connectionMode === 'online-public' && room.gameMode === gameMode && !room.inGame) {
            matchingRoomId = roomId
        }
    })
    return matchingRoomId
}

export {
    initializeRoom,
    getRoom,
    deleteRoom,
    getRoomConnectionMode,
    getRoomGameMode,
    isRoomChallengeMode,
    isRoomEmpty,
    setRoomInGame,
    setRoomOutOfGame,
    roomInLobby,
    isRoomFull,
    hasCountdownStarted,
    setCountdownStarted,
    resetCountdown,
    addUserToRoom,
    removeUserFromRoom,
    getUsersInRoom,
    isUserInRoom,
    findMatchingRoom,
}
