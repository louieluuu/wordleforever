import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from 'cors'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  }
});

app.use(cors())

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
