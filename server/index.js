const WORD_LIST = require("./data/wordList")
const VALID_GUESSES = require("./data/validGuesses")

// Generate uuids
const { v4: uuidv4 } = require("uuid")

// WebSockets
const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    // Client-side URL
    origin: "http://localhost:5173",
  },
})

// Global variables
const waitingRooms = new Set()

// Random matchmaking (non-lobby)
const queuedUsers = []

// Generates a random solution
function getRandomSolution() {
  const randomSolution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    .toUpperCase()
    .split("")
  console.log(`Solution: ${randomSolution}`)
  return randomSolution
}

// ! Challenge mode
// Generates a random starting word that always has exactly one green match
function getRandomFirstGuess(solution) {
  let randomFirstGuess
  while (true) {
    randomFirstGuess = VALID_GUESSES[Math.floor(Math.random() * VALID_GUESSES.length)].toUpperCase()
    let countGreenLetters = 0
    for (let i = 0; i < randomFirstGuess.length; ++i) {
      if (randomFirstGuess[i] === solution[i]) {
        countGreenLetters += 1
      }
    }
    if (countGreenLetters === 1) {
      console.log(`firstGuess: ${randomFirstGuess}`)
      break
    }
  }
  return randomFirstGuess.split("")
}

// All server-side socket logic is, by design, wrapped in the io.on("connection") function.
io.on("connection", (socket) => {
  // Print info when connections are made (io.engine contains metadata)
  console.log(`User connected: ${socket.id}`)
  const count = io.engine.clientsCount
  console.log(`Current # total users: ${count}`)

  // Create room
  socket.on("createRoom", () => {
    let newUuid = uuidv4()
    // Guarantees non-colliding rooms (even though the chance is infinitely small)
    while (waitingRooms.has(newUuid)) {
      newUuid = uuidv4()
    }

    socket.join(newUuid)
    socket.emit("returnUuid", newUuid)
    waitingRooms.add(newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid) => {
    // First check if the submitted ID is actually a waiting room
    if (!waitingRooms.has(uuid)) {
      socket.emit("roomError", uuid)
      return
    }
    socket.join(uuid)

    // Generate the word(s) required to play, then broadcast them to the room
    const solution = getRandomSolution()
    const firstGuess = getRandomFirstGuess(solution)
    io.to(uuid).emit("matchMade", uuid, solution)

    // TODO: I think we need to track waitingRooms as well as activeRooms.
    // TODO: activeRooms will track games that are in progress so there's no overlap.
    waitingRooms.delete(uuid)

    // const clientsInRoom = io.sockets.adapter.rooms.get(uuid)
    // console.log(clientsInRoom)
  })

  // Process the board to only display colors ("hiddenBoard")
  // Then show that hiddenBoard to the other user
  socket.on("guessSubmit", (uuid, newGameBoard) => {
    const hiddenBoard = newGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
    socket.to(uuid).emit("revealBoard", hiddenBoard)
  })
})

// This has to be different from the client port
const PORT = 4000

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// TODO: random matchmaking
// Queueing up random users logic
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
