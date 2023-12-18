// Services
import { initializeRoom, getRoomConnectionMode, getRoomGameMode, roomExists, roomInLobby } from '../services/roomService.js'
import { removeUser, setUsername } from '../services/userService.js'

function createRoom(connectionMode, gameMode, socket) {
    const roomId = initializeRoom(connectionMode, gameMode, socket)

    console.log(`Creating room: ${roomId}`)
    socket.emit('roomCreated', roomId)
}

function joinRoom(roomId, username, io, socket) {
    if (roomExists(roomId) && roomInLobby(roomId)) {
        console.log(`${socket.id} joining room: ${roomId}`)
        socket.join(roomId)

        setUsername(roomId, username, io, socket)
        socket.emit('roomJoined', getRoomConnectionMode(roomId), getRoomGameMode(roomId))
    } else {
        removeUser(socket, io)
        socket.emit('failedToJoinRoom')
    }
}

function startRoom(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit('roomStarted')
    }
}

export { createRoom, joinRoom, startRoom }