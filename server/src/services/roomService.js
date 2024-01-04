import { v4 as uuidv4 } from 'uuid'

// Database models
import Room from '../classes/Room.js'

// Services
import { getUser } from './userService.js'
import { resetPoints } from './gameService.js'

const Rooms = new Map()
const UserRoom = new Map()

const MAX_ROOM_SIZE = 4

function initializeRoom(connectionMode, gameMode) {
    const roomId = uuidv4()
    const room = new Room(connectionMode, gameMode)
    Rooms.set(roomId, room)
    return roomId
}

function getRoom(roomId) {
    try {
        const room = Rooms.get(roomId)
        return room ? room : null
    } catch (error) {
        console.error(`Error getting room: ${error.message}`)
        throw error
    }
}

function deleteRoom(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room) {
            Rooms.delete(roomId)
            // delete game objects
            // reset points
        }
    } catch (error) {
        console.error(`Error deleting room: ${error.message}`)
        throw error
    }
}

function getRoomConnectionMode(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.connectionMode
        }
        return null
    } catch (error) {
        console.error(`Error getting room connection mode: ${error.message}`)
        throw error
    }
}

function getRoomGameMode(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.gameMode
        }
        return null
    } catch (error) {
        console.error(`Error getting room game mode: ${error.message}`)
        throw error
    }
}

function isRoomChallengeMode(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.gameMode === 'Challenge'
        }
        return false
    } catch (error) {
        console.error(`Error getting room challenge mode info: ${error.message}`)
        throw error
    }
}

function getRoomSize(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.users.length
        }
        return 0
    } catch (error) {
        console.error(`Error getting room size: ${error.message}`)
        throw error
    }
}

function isRoomEmpty(roomId) {
	try {
		const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.users.length === 0
        }
		return true
	} catch (error) {
		console.error(`Error checking if the room is empty: ${error.message}`)
		throw error
	}
}

function setRoomInGame(roomId) {
    try {
		const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.inGame = true
        }
    } catch (error) {
        console.error(`Error setting room inGame status: ${error.message}`)
        throw error
    }
}

function setRoomOutOfGame(roomId) {
    try {
		const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.inGame = false
        }
    } catch (error) {
        console.error(`Error setting room inGame status: ${error.message}`)
        throw error
    }
}

function roomInLobby(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return !room.inGame
        }
        return false
    } catch (error) {
        console.error(`Error checking if room is in lobby: ${error.message}`)
        throw error
    }
}

function isRoomFull(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.users.length >= MAX_ROOM_SIZE
        }
        return false
    } catch (error) {
        console.error(`Error checking if room is full: ${error.message}`)
        throw error
    }
}

function hasCountdownStarted(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.countdownStarted
        }
        return false
    } catch (error) {
        console.error(`Error checking if countdown has started: ${error.message}`)
        throw error
    }
}

function setCountdownStarted(roomId) {
    try {
		const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.countdownStarted = true
        }
    } catch (error) {
        console.error(`Error setting room countdownStarted status: ${error.message}`)
        throw error
    }
}

function resetCountdown(roomId) {
    try {
		const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.countdownStarted = false
        }
    } catch (error) {
        console.error(`Error resetting room countdownStarted status: ${error.message}`)
        throw error
    }
}

async function addUserToRoom(userId, roomId) {
    try {
        const user = await getUser(userId)
        if (!user) {
            throw new Error(`User with ID ${userId} not found`)
        } else {
            const room = Rooms.get(roomId)
            if (room instanceof Room) {
                room.users.push(userId)
                userRoom.set(userId) = roomId
            }
        }
    } catch (error) {
        console.error(`Error adding user to room in the database: ${error.message}`)
        throw error
    }
}

function removeUserFromRoom(userId, roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            room.users = room.users.filter(user => user !== userId)
            userRoom.delete(userId)
        }
    } catch (error) {
        console.error(`Error removing user from room in the database: ${error.message}`)
        throw error
    }
}

function getUserRoom(userId) {
    try {
        return UserRoom.get(userId)
    } catch (error) {
        console.error(`Error getting user room from the database: ${error.message}`)
        throw error
    }
}

function getUsersInRoom(roomId) {
    try {
        const room = Rooms.get(roomId)
        if (room instanceof Room) {
            return room.users
        }
    } catch (error) {
        console.error(`Error getting users in room from the database: ${error.message}`)
        throw error
    }
}

export {
    initializeRoom,
    getRoom,
    deleteRoom,
    getRoomConnectionMode,
    getRoomGameMode,
    isRoomChallengeMode,
	getRoomSize,
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
	getUserRoom,
    getUsersInRoom,
}
