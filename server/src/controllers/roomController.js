// Services
import {
    initializeRoom,
    roomInLobby,
    isRoomFull,
    resetCountdown,
    addUserToRoom,
    getRoomConnectionMode,
    getRoomGameMode,
    hasCountdownStarted,
    setCountdownStarted,
} from '../services/roomService.js'
import { setUsername, broadcastUserInfo } from '../services/userService.js'

const PRIVATE_ROOM_COUNTDOWN_TIMER = 4
const PUBLIC_ROOM_COUNTDOWN_TIMER = 1

function createRoom(connectionMode, gameMode, socket) {
    try {
        const roomId = initializeRoom(connectionMode, gameMode)
        console.log(`Creating room: ${roomId}`)
        socket.emit('roomCreated', roomId)
    } catch (error) {
        console.error(`Error creating room: ${error.message}`)
        throw error
    }
}

async function joinRoom(roomId, username, io, socket) {
    try {
        if (await roomInLobby(roomId) && !await isRoomFull(roomId)) {
            console.log(`${socket.id} joining room: ${roomId}`)
            socket.join(roomId)
            socket.roomId = roomId
            await addUserToRoom(socket.id, roomId)
            await setUsername(socket.id, username)
            await broadcastUserInfo(roomId, io)
            socket.emit('roomJoined', await getRoomConnectionMode(roomId), await getRoomGameMode(roomId))
        } else {
            console.log(`${socket.id} failed to join room: ${roomId}`)
            socket.emit('failedToJoinRoom')
        }
    } catch (error) {
        console.error(`Error joining room: ${error.message}`)
        throw error
    }
}

async function handleCountdownStart(roomId, io) {
    try {
        if (!await hasCountdownStarted(roomId)) {
            await setCountdownStarted(roomId)
            io.to(roomId).emit('countdownStarted')
            let seconds
            const roomConnectionMode = await getRoomConnectionMode(roomId)
            if (roomConnectionMode === 'online-private') {
                seconds = PRIVATE_ROOM_COUNTDOWN_TIMER
            } else if (roomConnectionMode === 'online-public') {
                seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
            } else {
                seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
            }

            const countdownInterval = setInterval(async () => {
                if (!await hasCountdownStarted(roomId)) {
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
    } catch (error) {
        console.error(`Error starting countdown: ${error.message}`)
        throw error
    }
}

async function handleCountdownStop(roomId) {
    try {
        if (await hasCountdownStarted(roomId)) {
            resetCountdown(roomId)
        }
    } catch (error) {
        console.error(`Error stopping countdown: ${error.message}`)
        throw error
    }
}

async function handleMatchmaking(gameMode, socket) {
    try {
        const matchingRoom = await Room.findOne({ connectionMode: 'online-public', gameMode, inGame: false })
        if (matchingRoom) {
            socket.emit('matchFound', matchingRoom.roomId)
        } else {
            socket.emit('noMatchesFound')
        }
    } catch (error) {
        console.error(`Error with matchmaking: ${error.message}`)
        throw error
    }
}

function startRoom(roomId, io) {
    if (roomId) {
        io.to(roomId).emit('roomStarted')
    }
}

export { createRoom, joinRoom, handleCountdownStart, handleCountdownStop, handleMatchmaking }