import { getRoomFromId, roomExists, roomInLobby } from './roomService.js'

function setUsername(roomId, username, io, socket) {
    if (roomExists(roomId) && roomInLobby(roomId)) {
        const allUserInfo = getUserInfo(roomId)
        const currUserInfo = allUserInfo.get(socket.id) || {}
        allUserInfo.set(socket.id, {
            ...currUserInfo,
            username: username,
        })
        broadcastUserInfo(roomId, io)
    }    
}

function getUserInfo(roomId) {
    return getRoomFromId(roomId).userInfo
}

function mapToArray(userInfo) {
    return Array.from(userInfo.entries(), ([socketId, info]) => {
        const result = { socketId }

        for (const [key, value] of Object.entries(info)) {
            result[key] = value
        }

        return result
    })
}

function broadcastUserInfo(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit('userInfoUpdated', mapToArray(getUserInfo(roomId)))
    }
}

function broadcastFinalUserInfo(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit('finalUserInfo', mapToArray(getUserInfo(roomId)))
    }
}

function removeUser(socket, io) {
    const roomId = Array.from(socket.rooms)[1]

    if (roomId === undefined) {
        console.log(`User ${socket.id} disconnected without connecting to a room`)
    } else {
        console.log(`Removing user ${socket.id} from ${roomId}`)
        const currUserInfo = getUserInfo(roomId)
        currUserInfo.delete(socket.id)
        broadcastUserInfo(currUserInfo, roomId, io)
    }

    console.log(`User ${socket.id} disconnected`)
}

export {
    setUsername,
    getUserInfo,
    removeUser,
    mapToArray,
    broadcastUserInfo,
    broadcastFinalUserInfo
}