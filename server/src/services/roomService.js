import { v4 as uuidv4 } from 'uuid'

// Database models
import { Room, Game } from '../database/models.js'

// Services
import { getUser } from './userService.js'
import { resetPoints } from './gameService.js'

const MAX_ROOM_SIZE = 4

async function initializeRoom(connectionMode, gameMode, userId) {
    const roomId = await initializeRoomInfo(connectionMode, gameMode, userId)
    return roomId
}

async function initializeRoomInfo(connectionMode, gameMode, userId) {
    try {
        const room = new Room({
            roomId: uuidv4(),
            connectionMode,
			gameMode,
            hostUserId: userId,
            users: [],
            inGame: false,
            countdownStarted: false,
        })

        await room.save()
        console.log(`Room initialized and saved to the database: ${room.roomId}`)
		return room.roomId
    } catch (error) {
        console.error(`Error initializing room and saving to the database: ${error.message}`)
        throw error
    }
}

async function getRoom(roomId) {
    try {
        const room = await Room.findOne({ roomId }).lean()
        return room
    } catch (error) {
        console.error(`Error getting room from the database: ${error.message}`)
        throw error
    }
}

async function deleteRoom(roomId) {
    try {
		await Room.deleteOne({ roomId })
        // Delete all associated games as well
        await Game.deleteMany({ roomId })
        // Reset all user points
        await resetPoints(roomId)
    } catch (error) {
        console.error(`Error deleting room from the database: ${error.message}`)
        throw error
    }
}

async function getRoomConnectionMode(roomId) {
    try {
        const room = await getRoom(roomId)
        return room ? room.connectionMode : null
    } catch (error) {
        console.error(`Error getting room connection mode from the database: ${error.message}`)
        throw error
    }
}

async function getRoomGameMode(roomId) {
    try {
        const room = await getRoom(roomId)
        return room ? room.gameMode : null
    } catch (error) {
        console.error(`Error getting room connection mode from the database: ${error.message}`)
        throw error
    }
}

async function isRoomChallengeMode(roomId) {
    try {
        const room = await getRoom(roomId)
        return room && room.gameMode === 'Challenge'
    } catch (error) {
        console.error(`Error getting room size from the database: ${error.message}`)
        throw error
    }
}

async function getRoomSize(roomId) {
    try {
        const room = await getRoom(roomId)
        return room ? room.users.length : 0
    } catch (error) {
        console.error(`Error getting room size from the database: ${error.message}`)
        throw error
    }
}

async function isRoomEmpty(roomId) {
	try {
		const room = await getRoom(roomId)
		return !room || await getRoomSize(roomId) === 0
	} catch (error) {
		console.error(`Error checking if the room is empty in the database: ${error.message}`)
		throw error
	}
}

async function setRoomInGame(roomId) {
    try {
		await Room.updateOne({ roomId }, { $set: { inGame: true } })
    } catch (error) {
        console.error(`Error setting room inGame status in the database: ${error.message}`)
        throw error
    }
}

async function setRoomOutOfGame(roomId) {
    try {
		await Room.updateOne({ roomId }, { $set: { inGame: false } })
    } catch (error) {
        console.error(`Error setting room outOfGame status in the database: ${error.message}`)
        throw error
    }
}

async function roomInLobby(roomId) {
    try {
        const room = await getRoom(roomId)
        return room && !room.inGame
    } catch (error) {
        console.error(`Error checking if room is in the lobby in the database: ${error.message}`)
        throw error
    }
}

async function isRoomFull(roomId) {
    try {
        const room = await getRoom(roomId)
        return room && room.users.length >= MAX_ROOM_SIZE
    } catch (error) {
        console.error(`Error checking if room is full in the database: ${error.message}`)
        throw error
    }
}

async function hasCountdownStarted(roomId) {
    try {
        const room = await getRoom(roomId)
        return room && room.countdownStarted
    } catch (error) {
        console.error(`Error checking if countdown has started in the database: ${error.message}`)
        throw error
    }
}

async function setCountdownStarted(roomId) {
    try {
		await Room.updateOne({ roomId }, { $set: { countdownStarted: true } })
    } catch (error) {
        console.error(`Error setting countdown started status in the database: ${error.message}`)
        throw error
    }
}

async function resetCountdown(roomId) {
    try {
		await Room.updateOne({ roomId }, { $set: { countdownStarted: false } })
    } catch (error) {
        console.error(`Error resetting countdown status in the database: ${error.message}`)
        throw error
    }
}

async function addUserToRoom(userId, roomId) {
    try {
        const user = await getUser(userId)
        if (!user) {
            throw new Error(`User with ID ${userId} not found`)
        } else {
            await Room.updateOne({ roomId }, { $push: { users: userId }})
        }
    } catch (error) {
        console.error(`Error adding user to room in the database: ${error.message}`)
        throw error
    }
}

async function removeUserFromRoom(userId, roomId) {
    try {
        await Room.updateOne({ roomId }, { $pull: { users: userId } })
    } catch (error) {
        console.error(`Error removing user from room in the database: ${error.message}`)
        throw error
    }
}

async function getUserRoom(userId) {
    try {
        const room = await Room.findOne({ users: userId }).lean()
        return room ? room.roomId : null
    } catch (error) {
        console.error(`Error getting user room from the database: ${error.message}`)
        throw error
    }
}

async function getUsersInRoom(roomId) {
    try {
        const room = await getRoom(roomId)
        return room ? room.users : null
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
