import { getRoomFromId, deleteRoom, roomExists, roomInLobby, getRoomSize } from './roomService.js'

// Set the username initially when joining the room
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

// Already need to be in the room to keep username up to date with changes
// Was needed to split this from setUsername due to a userInfo object being created for a socket even if they failed to join the room through (socket.emit('updateUsername'))
function handleUsernameUpdate(roomId, username, io, socket) {
    if (roomExists(roomId) && roomInLobby(roomId) && isUserInRoom(roomId, socket)) {
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

function isUserInRoom(roomId, socket) {
    if (roomExists(roomId) && (getUserInfo(roomId).has(socket.id))) {
        return true
    }
    return false
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
        const roomIsEmpty = getRoomSize(roomId, io) <= 1
        const currUserInfo = getUserInfo(roomId)
        currUserInfo.delete(socket.id)
        broadcastUserInfo(roomId, io)
        if (roomIsEmpty) {
            deleteRoom(roomId)
        }
    }
}

function handleUserDisconnect(socket, io) {
    console.log(`User ${socket.id} disconnected`)
    removeUser(socket, io)
}

export {
    setUsername,
    handleUsernameUpdate,
    getUserInfo,
    isUserInRoom,
    removeUser,
    handleUserDisconnect,
    mapToArray,
    broadcastUserInfo,
    broadcastFinalUserInfo
}