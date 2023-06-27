// TODO: managing of rooms when people don't explicitly disconnect (ex. close tab)
// TODO:

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
const activeRooms = []

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
  console.log(`Current # total users on site: ${count}`)

  // Create room
  socket.on("createRoom", () => {
    let newUuid = uuidv4()
    // Guarantees non-colliding rooms (even though the chance is infinitely small)
    while (waitingRooms.has(newUuid)) {
      newUuid = uuidv4()
    }

    socket.join(newUuid)
    socket.emit("roomCreated", newUuid)
    waitingRooms.add(newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid) => {
    // Check validity of room
    if (activeRooms.some((object) => object.roomId === uuid)) {
      const reason = "This room is already in progress."
      socket.emit("roomError", reason)
      return
    }

    if (!waitingRooms.has(uuid)) {
      const reason = "This room does not exist."
      socket.emit("roomError", reason)
      return
    }

    socket.join(uuid)

    const countClientsInRoom = io.sockets.adapter.rooms.get(uuid).size
    console.log(`countClientsInRoom: ${countClientsInRoom}`)

    if (countClientsInRoom === 2) {
      // TODO: Random matchmaking
      // socket.emit("matchMade", uuid)
    }
  })

  socket.on("startRoom", (uuid) => {
    // Each active room will keep track of the # of gameOvers in that room;
    // necessary to deal with the case where all players run out of guesses.

    const newRoom = {
      roomId: uuid,
      size: io.sockets.adapter.rooms.get(uuid).size,
      countGameOvers: 0,
    }

    activeRooms.push(newRoom)

    waitingRooms.delete(uuid)

    socket.emit("roomStarted", uuid)
  })

  socket.on("startNewGame", (uuid, isChallengeMode) => {
    // Reset room values.
    const relevantRoom = activeRooms.find((object) => object.roomId === uuid)
    relevantRoom.countGameOvers = 0

    // Generate the required number of Boards as determined by the room.
    // Note that for simplicity, just one array of boards (containing all sockets)
    // is broadcasted to all the clients. On the client-side, each client will
    // filter out their own socket, resulting in their respective "otherBoards".
    const socketsInRoom = io.sockets.adapter.rooms.get(uuid)
    console.log(socketsInRoom)

    const allGameBoards = []
    socketsInRoom.forEach((socketId) => {
      allGameBoards.push({
        socketId: socketId,
        gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })),
      })
    })

    // Generate the word(s) required to play, then broadcast them to the room.
    const solution = getRandomSolution()

    let firstGuess
    isChallengeMode ? (firstGuess = getRandomFirstGuess(solution)) : (firstGuess = null)

    io.to(uuid).emit("gameStarted", uuid, allGameBoards, solution, firstGuess)
  })

  // Process the board to only display colors
  // Then show that hiddenBoard to the other user
  socket.on("wrongGuess", (socketId, uuid, newGameBoard) => {
    const noLettersBoard = newGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
    socket.to(uuid).emit("otherBoardUpdated", socketId, noLettersBoard)
  })

  // Game Over logic
  socket.on("correctGuess", (uuid) => {
    io.to(uuid).emit("gameOver", uuid)
  })

  socket.on("outOfGuesses", (roomId) => {
    const relevantRoom = activeRooms.find((object) => object.roomId === roomId)
    relevantRoom.countGameOvers += 1
    if (relevantRoom.countGameOvers === relevantRoom.size) {
      io.to(roomId).emit("gameOver", roomId)
    } else {
      io.to(roomId)
    }
  })

  socket.on("revealGameBoard", (uuid, gameBoard) => {
    socket.to(uuid).emit("gameBoardBroadcasted", socket.id, gameBoard)
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
