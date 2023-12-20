import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// Controllers
import { createRoom, joinRoom, startCountdown, handleMatchmaking } from './controllers/roomController.js'

// Services
import { updateUsername, removeUser } from './services/userService.js'
import { startGame, handleWrongGuess, handleCorrectGuess, handleOutOfGuesses } from './services/gameService.js'

const app = express()
const server = createServer(app)

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
})

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`)

    // Interact with WaitingRoom component
    // Find match
    socket.on('findMatch', (gameMode) => handleMatchmaking(gameMode, socket, io))
    // Create room
    socket.on('createRoom', (connectionMode, gameMode) => createRoom(connectionMode, gameMode, socket))
    // Join room
    socket.on('joinRoom', (roomId, username) => joinRoom(roomId, username, io, socket))
    // Username update
    socket.on('updateUsername', (roomId, username) => updateUsername(roomId, username, io, socket))
    // Start countdown before starting the game -> navigate to game room
    socket.on('startCountdown', (roomId) => startCountdown(roomId, io))

    // Interact with GameContainer component
    socket.on('startOnlineGame', (roomId) => startGame(roomId, io))
    // General game flow
    socket.on('wrongGuess', (roomId, updatedGameBoard) => handleWrongGuess(roomId, updatedGameBoard, io, socket))
    socket.on('correctGuess', (roomId, updatedGameBoard) => handleCorrectGuess(roomId, updatedGameBoard, io, socket))
    socket.on('outOfGuesses', (roomId) => handleOutOfGuesses(roomId, io))

    // User disconnect and cleanup
    socket.on('disconnecting', () => removeUser(socket, io))

})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
