// Database models
import { User } from '../database/models.js'

// Services
import {
    getRoom,
    getUserRoom,
    roomInLobby,
    deleteRoom,
    removeUserFromRoom,
    isRoomEmpty,
} from './roomService.js'



async function initializeUserInfo(userId) {
    try {
        const user = new User({ userId })
        await user.save()
        return user
    } catch (error) {
        console.error(`Error initializing user info in the database: ${error.message}`)
        throw error
    }
}

async function getUser(userId) {
    try {
        const user = await User.findOne({ userId }).lean()
        return user
    } catch (error) {
        console.error(`Error getting user info from the database: ${error.message}`)
        throw error
    }
}

async function getAllUserInfoInRoom(roomId) {
    try {
        const room = await getRoom(roomId)
        if (room) {
            const allUserInfo = User.find({ userId: { $in: room.users }}).lean()
            return allUserInfo
        }
    } catch (error) {
        console.error(`Error getting user info from room: ${error.message}`)
        throw error
    }
}

async function deleteUser(userId) {
    try {
        await User.deleteOne({ userId })
    } catch (error) {
        console.error(`Error deleting user from the database: ${error.message}`)
        throw error
    }
}

async function setUsername(userId, username) {
    try {
        await User.updateOne({ userId }, { $set: { username }})
    } catch (error) {
        console.error(`Error setting username in the database: ${error.message}`);
        throw error;
    }
}

// Already need to be in the room to keep username up to date with changes
async function handleUsernameUpdate(roomId, userId, username, io) {
    if (await roomInLobby(roomId) && await isUserInRoom(roomId, userId)) {
        await setUsername(userId, username)
        broadcastUserInfo(roomId, io)
    }    
}

// Check if this is necessary later?
async function isUserInRoom(roomId, userId) {
    try {
        const room = await Room.findOne({ roomId, users: userId })
        return !!room
    } catch (error) {
        console.error(`Error checking if user is in the room in the database: ${error.message}`);
        throw error;
    }
}

async function broadcastUserInfo(roomId, io) {
    if (roomId) {
        io.to(roomId).emit('userInfoUpdated', await getAllUserInfoInRoom(roomId))
    } else {
        console.error('Invalid roomId for broadcasting user info')
    }
}

async function broadcastFinalUserInfo(roomId, io) {
    if (roomId) {
        io.to(roomId).emit('finalUserInfo', await getAllUserInfoInRoom(roomId))
    } else {
        console.error('Invalid roomId for broadcasting final user info')
    }
}

async function handleUserDisconnect(userId, io) {
    console.log(`User ${userId} disconnected`)
    handleLeaveRoom(userId, io)
    deleteUser(userId)
}

async function handleLeaveRoom(userId, io) {
    const roomId = await getUserRoom(userId)
    if (roomId) {
        console.log(`Removing user ${userId} from ${roomId}`)
        await removeUserFromRoom(userId, roomId)
        if (await isRoomEmpty(roomId)) {
            deleteRoom(roomId)
        }
    }
    broadcastUserInfo(roomId, io)
}

export {
    initializeUserInfo,
    getUser,
    getAllUserInfoInRoom,
    setUsername,
    handleUsernameUpdate,
    broadcastUserInfo,
    broadcastFinalUserInfo,
    handleUserDisconnect,
    handleLeaveRoom,
}