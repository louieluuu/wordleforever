import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import './database/db.js'
import cors from 'cors'

// Controllers
import { createRoom, joinRoom, handleCountdownStart, handleCountdownStop, handleMatchmaking } from './controllers/roomController.js'

// Services
import { handleUsernameUpdate, handleUserDisconnect, handleLeaveRoom, initializeUserInfo } from './services/userService.js'
import { handleGameStart, handleWrongGuess, handleCorrectGuess, handleOutOfGuesses } from './services/gameService.js'


const app = express()
const server = createServer(app)

app.use(cors())

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
})

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`)
    initializeUserInfo(socket.id)

    // Interact with WaitingRoom component
    // Find match
    socket.on('findMatch', async (gameMode) => await handleMatchmaking(gameMode, socket))
    // Create room
    socket.on('createRoom', async (connectionMode, gameMode) => await createRoom(connectionMode, gameMode, socket))
    // Join room
    socket.on('joinRoom', async (roomId, username) => await joinRoom(roomId, username, io, socket))
    // Username update
    socket.on('updateUsername', async (roomId, username) => await handleUsernameUpdate(roomId, socket.id, username, io))
    // Start countdown before starting the game -> navigate to game room
    socket.on('startCountdown', async (roomId) => await handleCountdownStart(roomId, io))
    // Stop countdown - no longer enough users in the room
    socket.on('stopCountdown', async (roomId) => await handleCountdownStop(roomId, io))

    // Interact with GameContainer component
    socket.on('startOnlineGame', async (roomId) => await handleGameStart(roomId, io))
    // General game flow
    socket.on('wrongGuess', async (roomId, updatedGameBoard) => await handleWrongGuess(roomId, socket.id, updatedGameBoard, io))
    socket.on('correctGuess', async (roomId, updatedGameBoard) => await handleCorrectGuess(roomId, socket.id, updatedGameBoard, io))
    socket.on('outOfGuesses', async (roomId) => await handleOutOfGuesses(roomId, io))

    // User disconnect and cleanup
    socket.on('disconnecting', async () => await handleUserDisconnect(socket, io))
    socket.on('leaveRoom', async () => await handleLeaveRoom(socket, io))

})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
