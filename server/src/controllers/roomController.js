// Services
import { initializeRoom, getRoomTypeFromConnection, getRoomConnectionMode, getRoomGameMode, roomExists, roomInLobby, isRoomFull } from '../services/roomService.js'
import { setUsername, isUserInRoom } from '../services/userService.js'

function createRoom(connectionMode, gameMode, socket) {
    const roomId = initializeRoom(connectionMode, gameMode, socket)

    console.log(`Creating room: ${roomId}`)
    socket.emit('roomCreated', roomId)
}

function joinRoom(roomId, username, io, socket) {
    if (!isUserInRoom(roomId, socket)) {
        if (roomExists(roomId) && roomInLobby(roomId) && !isRoomFull(roomId, io)) {
            console.log(`${socket.id} joining room: ${roomId}`)
            socket.join(roomId)
    
            setUsername(roomId, username, io, socket)
            socket.emit('roomJoined', getRoomConnectionMode(roomId), getRoomGameMode(roomId))
        } else {
            console.log(`${socket.id} failed to join room: ${roomId}`)
            socket.emit('failedToJoinRoom')
        }
    }
}

function startRoom(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit('roomStarted')
    }
}

// Will always be online-public connection mode
function handleMatchmaking(gameMode, socket, io) {
    const publicRooms = getRoomTypeFromConnection('online-public')
    let matchingRoomId

    for (const [roomId, roomInfo] of publicRooms) {
        if (gameMode === roomInfo.gameMode && roomInLobby(roomId) && !isRoomFull(roomId, io)) {
            matchingRoomId = roomId
            break
        }
    }

    if (matchingRoomId) {
        socket.emit('matchFound', matchingRoomId)
    } else {
        socket.emit('noMatchesFound')
    }
}

export { createRoom, joinRoom, startRoom, handleMatchmaking }