// Services
import {
    initializeRoom,
    getRoomTypeFromConnection,
    getRoomConnectionMode,
    getRoomGameMode,
    roomExists,
    roomInLobby,
    isRoomFull,
    hasCountdownStarted,
    setCountdownStarted,
    resetCountdown
} from '../services/roomService.js'
import { setUsername, isUserInRoom } from '../services/userService.js'

const PRIVATE_ROOM_COUNTDOWN_TIMER = 4
const PUBLIC_ROOM_COUNTDOWN_TIMER = 8

function createRoom(connectionMode, gameMode, socket) {
    const roomId = initializeRoom(connectionMode, gameMode, socket)

    console.log(`Creating room: ${roomId}`)
    socket.emit('roomCreated', roomId)
}

function joinRoom(roomId, username, io, socket) {
    // Handles duplicate emits from the same socket
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

function handleCountdownStart(roomId, io) {
    if (roomExists(roomId) && !hasCountdownStarted(roomId)) {
        setCountdownStarted(roomId)
        io.to(roomId).emit('countdownStarted')
        let seconds
        if (getRoomConnectionMode(roomId).includes('private')) {
            seconds = PRIVATE_ROOM_COUNTDOWN_TIMER
        } else if (getRoomConnectionMode(roomId).includes('public')) {
            seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
        } else {
            seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
        }

        const countdownInterval = setInterval(() => {
            if (!hasCountdownStarted(roomId)) {
                clearInterval(countdownInterval)
                return
            }
            seconds--
            io.to(roomId).emit('countdownTick', seconds)

            if (seconds === 0) {
                clearInterval(countdownInterval)
                startRoom(roomId, io)
            }
        }, 1000)
    }
}

function handleCountdownStop(roomId, io) {
    if (roomExists(roomId) && hasCountdownStarted(roomId)) {
        resetCountdown(roomId)
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

export { createRoom, joinRoom, handleCountdownStart, handleCountdownStop, startRoom, handleMatchmaking }