// TODO: don't need to pass in socketId, pretty sure you can just do socket.id

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
const Public = new Map()
const Private = new Map()

const Rooms = { Public, Private }

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

// Helper function
function getPublicOrPrivateRooms(roomId) {
  if (Rooms.Public.has(roomId)) {
    return Rooms.Public
  }
  //
  else if (Rooms.Private.has(roomId)) {
    return Rooms.Private
  }
  // Not sure when this would happen, but...
  else {
    return undefined
  }
}

// Cleans up Rooms if the user is the last to leave (i.e. size === 1).
// This way, Rooms doesn't needlessly keep track of empty rooms.
function cleanupRooms(roomId) {
  if (io.sockets.adapter.rooms.get(roomId).size === 1) {
    const relevantRooms = getPublicOrPrivateRooms(roomId)
    if (relevantRooms === undefined) {
      console.log("Error: cleanupRooms() called on invalid roomId")
      return
    }

    relevantRooms.delete(roomId)
  }
}

function startCountdown(roomId) {
  let seconds = 5

  const timer = setInterval(() => {
    if (seconds < 4) {
      // As the countdown ends, if the room is still populated (people haven't left),
      // go ahead and initialize the room.

      // The system here is admittedly scuffed because the countdown is broadcasted
      // to all sockets in the room, but I only want one socket to initialize the room.
      // This wasn't a problem in the private lobbies, because there is no countdown
      // in a private lobby - the host gets to control when to initialize the room.

      // So... I'm just going to pick a random socket in the room to initialize the room.
      const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId))
      if (socketIds.size !== 0) {
        const randomSocket = socketIds[Math.floor(Math.random() * socketIds.length)]
        io.to(randomSocket).emit("roomCountdownOver")
      }
      clearInterval(timer)
      return
    }

    io.to(roomId).emit("countdownTick", seconds)
    seconds -= 1
  }, 1250)
}

// All server-side socket logic is, by design, wrapped in the io.on("connection") function.
io.on("connection", (socket) => {
  // Print info when connections are made (io.engine contains metadata)
  console.log(`User connected: ${socket.id}`)
  const count = io.engine.clientsCount
  console.log(`Current # total users on site: ${count}`)

  // Note that we use the special event "disconnecting" here instead of "disconnect",
  // as we can still access the socket's info before the actual disconnect occurs.
  socket.on("disconnecting", () => {
    // socket.rooms[1] returns the room the socket is in
    const roomId = Array.from(socket.rooms)[1]

    // This occurs if the user disconnects and never played online during the session
    if (roomId === undefined) {
      return
    }

    cleanupRooms(roomId)

    console.log("From disconnecting:")
    console.log(Rooms)
  })

  // Create room
  socket.on("createRoom", (socketId, nickname, gameMode, isChallengeOn) => {
    let newUuid = uuidv4()
    // Guarantees non-colliding rooms (even though the chance is infinitely small)
    while (Rooms.Public.has(newUuid) || Rooms.Private.has(newUuid)) {
      newUuid = uuidv4()
    }

    // getPublicOrPrivateRooms() only works on roomIds, but when you're creating a room,
    // the roomId hasn't been established yet - we'll use the gameMode instead to decide
    // whether it should be a Public or Private game.
    let relevantRooms

    if (gameMode.includes("public")) {
      relevantRooms = Rooms.Public
    }
    //
    else if (gameMode.includes("private")) {
      relevantRooms = Rooms.Private
    }

    // More properties will be added to the Room later, but this is all we need for now.
    relevantRooms.set(newUuid, {
      // Nicknames: new Map([[socketId, nickname]]),
      Nicknames: new Map(),
      isChallengeOn: isChallengeOn,
      isInGame: false,
    })

    // I tried desperately to get the flow to work like this:
    // -client: createRoom
    // -server: roomCreated
    // -client: joinRoom

    // But it didn't work, so here we are... joining manually
    // (another consequence is nicknames state has to start as [nickname])

    // socket.join(newUuid)
    // ! ^ update, I got it to work with an if statement in the useEffect

    socket.emit("roomCreated", newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid, socketId, nickname) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Check validity of room
    if (relevantRooms === undefined) {
      const reason = "This room does not exist."
      socket.emit("roomError", reason)
      return
    }

    if (relevantRooms.get(uuid).isInGame === true) {
      const reason = "This room is already in progress."
      socket.emit("roomError", reason)
      return
    }

    // Add user to room
    socket.join(uuid)
    const nicknamesMap = relevantRooms.get(uuid).Nicknames
    nicknamesMap.set(socketId, nickname)

    // TODO: demo for Thomas
    // const socketsMap = relevantRooms.get(uuid).Sockets
    // const socketInfo = socketsMap.get(socketId)
    // socketInfo.nickname = nickname
    // ...

    // Socket.IO does not emit Maps or Iterators, so we need to convert it to an Array first.
    const nicknamesArray = Array.from(nicknamesMap.values())
    io.to(uuid).emit("nicknamesChanged", nicknamesArray)

    // In Private Rooms, the host gets to choose when to start the game.
    // However, in Public Rooms, the room will initiate a 10s countdown
    // when 2+ players have been matched.
    if (relevantRooms === Rooms.Public && io.sockets.adapter.rooms.get(uuid).size > 1) {
      startCountdown(uuid)
    }
  })

  // Handle nickname changes
  socket.on("nicknameChange", (uuid, socketId, newNickname) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    const nicknamesMap = relevantRooms.get(uuid).Nicknames
    nicknamesMap.set(socketId, newNickname)
    const nicknamesArray = Array.from(nicknamesMap.values())
    io.to(uuid).emit("nicknamesChanged", nicknamesArray)
  })

  // Seek match
  socket.on("seekMatch", (isChallengeOn) => {
    // Seeking a match is exclusively a Public Rooms action, so that's what we'll be working with.

    // If there are no Public Rooms, create a new one
    if (Rooms.Public.size === 0) {
      socket.emit("noMatchesFound")
      return
    }

    // If there are existing Public Rooms, try to find a valid matching room, namely:
    // 1 - the Room must not already be in progress
    // 2 - the Room must not be full (i.e. > 4)
    // 3 - the ChallengeOn must match
    const publicRoomsArray = Array.from(Rooms.Public.entries())
    const matchingRoom = publicRoomsArray.find(
      ([roomId, roomObj]) =>
        roomObj.isInGame === false &&
        io.sockets.adapter.rooms.get(roomId).size < 4 &&
        roomObj.isChallengeOn === isChallengeOn
    )

    // If no matches are found, create a new Public Room
    if (matchingRoom === undefined) {
      socket.emit("noMatchesFound")
      return
    }

    // If a match is found, join the room
    const matchingRoomId = matchingRoom[0]
    socket.emit("matchFound", matchingRoomId)
  })

  // Leave room
  socket.on("leaveRoom", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Update nicknames
    const nicknamesMap = relevantRooms.get(uuid).Nicknames
    nicknamesMap.delete(socket.id)
    const nicknamesArray = Array.from(nicknamesMap.values())
    io.to(uuid).emit("nicknamesChanged", nicknamesArray)

    cleanupRooms(uuid)

    socket.leave(uuid)

    console.log("From leaveRoom:")
    console.log(Rooms)
  })

  socket.on("initializeRoom", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Adding some more properties to the Room.
    // Each active room will keep track of the # of gameOvers in that room;
    // necessary to deal with the case where all players run out of guesses.
    const previousValue = relevantRooms.get(uuid)
    relevantRooms.set(uuid, {
      ...previousValue,
      isInGame: true,
      countGameOvers: 0,
    })

    socket.emit("roomInitialized", uuid)
  })

  // TODO: Naming of this could probably be more on point. Maybe startNewOnlineGame?
  socket.on("startNewGame", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Reset room values.
    relevantRooms.get(uuid).countGameOvers = 0

    // Generate the required number of Boards as determined by the room.
    // Note that for simplicity, just one array of boards (containing all sockets)
    // is broadcasted to all the clients. On the client-side, each client will
    // filter out their own socket, resulting in their respective "otherBoards".
    const socketsInRoom = io.sockets.adapter.rooms.get(uuid)

    const allGameBoards = []
    socketsInRoom.forEach((socketId) => {
      allGameBoards.push({
        socketId: socketId,
        nickname: relevantRooms.get(uuid).Nicknames.get(socketId),
        gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })),
      })
    })

    // Generate the word(s) required to play, then broadcast them to the room.
    const solution = getRandomSolution()
    let challengeModeGuess = relevantRooms.get(uuid).isChallengeOn
      ? getRandomFirstGuess(solution)
      : null

    io.to(uuid).emit(
      "gameStarted",
      uuid,
      allGameBoards,
      solution,
      relevantRooms.get(uuid).isChallengeOn,
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
  socket.on("correctGuess", (socketId, uuid) => {
    socket.emit("updateScoreWinner", socketId)
    // socket.to(uuid).emit("updateScoreLoser")
    io.to(uuid).emit("gameOver", uuid)
  })

  socket.on("outOfGuesses", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    relevantRooms.get(uuid).countGameOvers += 1

    if (relevantRooms.get(uuid).countGameOvers === io.sockets.adapter.rooms.get(uuid).size) {
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

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
