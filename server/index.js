import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { v4 as uuidv4 } from 'uuid'
import cors from 'cors'

const app = express()
const server = createServer(app)

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  }
})

// All logic contained here
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`)

  socket.on('createRoom', () => {
    
    const roomId = uuidv4()
    socket.join(roomId)
    socket.emit('roomCreated', roomId);
    console.log(`User ${socket.id} created room ${roomId}`)
  })

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
