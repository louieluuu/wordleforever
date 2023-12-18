import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// Controllers
import { createRoom, joinRoom, startRoom } from './controllers/roomController.js'

// Services
import { setUsername, removeUser } from './services/userService.js'
import { startGame, handleWrongGuess, handleCorrectGuess } from './services/gameService.js'

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

    // Create room
    socket.on('createRoom', (connectionMode, gameMode) => createRoom(connectionMode, gameMode, socket))
    // Join room
    socket.on('joinRoom', (roomId, username) => joinRoom(roomId, username, io, socket))
    // Username update
    socket.on('updateUsername', (roomId, username) => setUsername(roomId, username, io, socket))

    // Start room - interacts with waiting room, navigates to game room
    socket.on('startRoom', (roomId) => startRoom(roomId, io))
    // Start game - passes the user all relevant game information that may be necessary to render the game container
    socket.on('startOnlineGame', (roomId) => startGame(roomId, io))
    // General game flow
    socket.on('wrongGuess', (roomId, updatedGameBoard) => handleWrongGuess(roomId, updatedGameBoard, io, socket))
    socket.on('correctGuess', (roomId, updatedGameBoard) => handleCorrectGuess(roomId, updatedGameBoard, io, socket))

    // User disconnect and cleanup
    socket.on('disconnecting', () => removeUser(socket, io))

})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
