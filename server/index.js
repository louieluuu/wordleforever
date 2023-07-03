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
const Rooms = new Map()

// Random matchmaking (non-lobby)
const queuedUsers = []

// TODO: These functions need to be written on the client-side for solo mode.
// TODO: Wonder if it's possible to pass those functions here so less repeating?
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

  // TODO: just for debugging
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}; ${reason}`)
  })

  // Note that we use the special event "disconnecting" here instead of "disconnect",
  // as we can still access the socket's info before the actual disconnect occurs.
  socket.on("disconnecting", () => {
    // socket.rooms[1] returns the room the socket is in
    const roomId = Array.from(socket.rooms)[1]

    // This occurs if the user disconnects and never played online during the session
    if (roomId === undefined) {
      return
    }

    // Cleanup Rooms if the user is the last to leave (i.e. size === 1).
    // This way, Rooms doesn't needlessly keep track of empty rooms.
    if (io.sockets.adapter.rooms.get(roomId).size === 1) {
      Rooms.delete(roomId)
    }
  })

  // Create room
  socket.on("createRoom", (socketId, nickname, isChallengeMode) => {
    let newUuid = uuidv4()
    // Guarantees non-colliding rooms (even though the chance is infinitely small)
    while (Rooms.has(newUuid)) {
      newUuid = uuidv4()
    }

    // More properties will be added to the Room later, but this is all we need for now.
    Rooms.set(newUuid, {
      Nicknames: new Map([[socketId, nickname]]),
      isChallengeMode: isChallengeMode,
      isInGame: false,
    })

    // I tried desperately to get the flow to work like this:
    // -client: createRoom
    // -server: roomCreated
    // -client: joinRoom

    // But it didn't work, so here we are...
    // (another consequence is nicknames state has to start as [nickname])
    socket.join(newUuid)
    socket.emit("roomCreated", newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid, socketId, nickname) => {
    // Check validity of room
    if (!Rooms.has(uuid)) {
      const reason = "This room does not exist."
      socket.emit("roomError", reason)
      return
    }

    if (Rooms.get(uuid).isInGame === true) {
      const reason = "This room is already in progress."
      socket.emit("roomError", reason)
      return
    }

    console.log(socketId)

    // TODO: Need to remove nicknames when people leave.
    // Add user to room
    socket.join(uuid)
    const nicknamesMap = Rooms.get(uuid).Nicknames
    nicknamesMap.set(socketId, nickname)
    console.log(nicknamesMap)

    // Socket.IO does not emit Maps or Iterators, so we need to convert it to an Array first.
    const nicknamesArray = Array.from(nicknamesMap.values())
    io.to(uuid).emit("nicknamesChanged", nicknamesArray)
  })

  // Handle nickname changes
  socket.on("nicknameChange", (uuid, socketId, newNickname) => {
    const nicknamesMap = Rooms.get(uuid).Nicknames
    nicknamesMap.set(socketId, newNickname)
    const nicknamesArray = Array.from(nicknamesMap.values())
    io.to(uuid).emit("nicknamesChanged", nicknamesArray)
  })

  socket.on("initializeRoom", (uuid) => {
    // Adding some more properties to the Room.
    // Each active room will keep track of the # of gameOvers in that room;
    // necessary to deal with the case where all players run out of guesses.
    const previousValue = Rooms.get(uuid)
    Rooms.set(uuid, {
      ...previousValue,
      isInGame: true,
      size: io.sockets.adapter.rooms.get(uuid).size,
      countGameOvers: 0,
    })

    socket.emit("roomInitialized", uuid)
  })

  socket.on("startNewGame", (uuid) => {
    // Reset room values.
    // TODO: Might need to update nicknames as well when people disconnect/leave
    Rooms.get(uuid).countGameOvers = 0

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
        nickname: Rooms.get(uuid).Nicknames.get(socketId),
        gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })),
      })
    })

    // Generate the word(s) required to play, then broadcast them to the room.
    const solution = getRandomSolution()
    let challengeModeGuess = Rooms.get(uuid).isChallengeMode ? getRandomFirstGuess(solution) : null

    io.to(uuid).emit(
      "gameStarted",
      uuid,
      allGameBoards,
      solution,
      Rooms.get(uuid).isChallengeMode,
      challengeModeGuess
    )
  })

  // Process the board to hide the letters but still display the colors
  // Then show that hiddenBoard to the other users
  socket.on("wrongGuess", (socketId, uuid, newGameBoard) => {
    const noLettersBoard = newGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
    socket.to(uuid).emit("otherBoardUpdated", socketId, noLettersBoard)
  })

  // Game Over logic
  socket.on("correctGuess", (uuid) => {
    io.to(uuid).emit("gameOver", uuid)
  })

  socket.on("outOfGuesses", (uuid) => {
    Rooms.get(uuid).countGameOvers += 1

    if (Rooms.get(uuid).countGameOvers === Rooms.get(uuid).size) {
      io.to(uuid).emit("gameOver", uuid)
    }
  })

  socket.on("revealGameBoard", (uuid, gameBoard) => {
    socket.to(uuid).emit("gameBoardBroadcasted", socket.id, gameBoard)
  })
})

// This has to be different from the client port
const IP = "192.168.1.72"
const PORT = 4000

httpServer.listen(PORT, IP, () => {
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
