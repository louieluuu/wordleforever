// TODO: importing the WORD_LIST is weird b/c CommonJS / ESModule
const WORD_LIST = ["horse", "ports", "treat"]

// Room IDs should be different from socket IDs, else glitchy
const { v4: uuidv4 } = require("uuid")

// add, size, has, delete, forEach,
const waitingRooms = new Set()

const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    // This origin should be where the client is running (5173)
    origin: "*",
  },
})

// ! I don't think this is necessary
// const cors = require("cors")
// app.use(cors()) // Add cors middleware

// Matchmaking
const queuedUsers = []

// Generate a single solution (outside of io connection)
const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase()
const solution = randomWord.split("")
console.log(solution)

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.broadcast.emit("userConnected", socket.id)

  // io.engine is the underlying thing, you can maybe think of it as metadata-y
  // Fetch the number of clients using io.engine
  const count = io.engine.clientsCount
  console.log(`total # clients connected: ${count}`)

  io.emit("newSolution", solution)

  // Create room logic
  socket.on("createRoom", (lobbyId) => {
    const uuid = uuidv4()
    console.log(`uuid: ${uuid}`)
    socket.join(uuid)
    socket.emit("returnUuid", uuid)
    waitingRooms.add(uuid)

    // // Prevent duplicate queueing (double clicking)
    // if (queuedUsers.includes(lobbyId)) {
    //   return
    // }
    // queuedUsers.push(lobbyId)

    // console.log(`List of queued users now: ${queuedUsers}`)

    // // if there are 2 players queued, then make them join a room together
    // if (queuedUsers.length == 2) {
    //   // pop twice
    //   queuedUsers.pop()
    //   queuedUsers.pop()
    //   // // Should leave your room before joining another one;
    //   // // doesn't automatically leave, I've tested it
    //   // socket.leave(lobbyId)
    //   // console.log(`You have left the room: ${lobbyId}`)
    //   // console.log(`You have joined the room: ${roomId}`)
    //   console.log(`List of queued users now: ${queuedUsers}`)

    //   io.to(roomId).emit("matchMade")

    //   const clientsInRoom = io.sockets.adapter.rooms.get(roomId)
    //   console.log(clientsInRoom)
    // }
  })

  socket.on("joinRoom", (uuid) => {
    // First check if the submitted uuid is actually an waiting room
    if (!waitingRooms.has(uuid)) {
      socket.emit("roomError", uuid)
      return
    }

    socket.join(uuid)
    io.to(uuid).emit("matchMade", uuid)
    waitingRooms.delete(uuid)
    const clientsInRoom = io.sockets.adapter.rooms.get(uuid)
    console.log(clientsInRoom)
  })

  // Process the board to only display colors
  // Then show the hidden board to the other user
  socket.on("guessSubmit", (uuid, coloredGameBoard) => {
    const hiddenBoard = coloredGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
    socket.to(uuid).emit("revealBoard", hiddenBoard)
  })
})

// This has to be different from the client port
const PORT = 4000

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// middleware = a function that gets executed for every incoming connection (middle man)
// -useful for logging, authentication, ...
// io.use((socket, next))

// io.emit sends to all sockets
// socket.emit sends to only the socket that sent the message
// io.emit belongs under the io.on("connection") event
