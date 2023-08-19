// TODO: don't need to pass in socketId, pretty sure you can just do socket.id

// TODO: Big server-crashing bug: if both users leave a public matchmaking room,
// TODO: the server just crashes.

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

// We split the Rooms into Public and Private, as this is more extensible.
// ex. if we want to display the number of active users in the public online matchmaking mode.
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

// Cleans up the Rooms object if the user is the last to leave (i.e. size === 1).
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

// TODO: Still handling the case where a player leaves as the countdown is going.
// TODO: An important bug, as it crashes the server currently.
function startCountdown(roomId) {
  let seconds = 5

  const timer = setInterval(() => {
    if (seconds < 4) {
      // As the countdown ends, if the room is still populated (people haven't left),
      // go ahead and initialize the room.
      if (io.sockets.adapter.rooms.get(roomId) === undefined) {
        console.log("Fking gg. Clearing interval.")
        clearInterval(timer)
        return
      }

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

    // This occurs if the user disconnects and never played online (i.e. joined a room)
    // during the session.
    if (roomId === undefined) {
      console.log(`Socket ${socket.id} disconnected without joining a room.`)
      return
    }

    cleanupRooms(roomId)

    console.log("From disconnecting:")
    console.log(Rooms)
  })

  // Create room
  socket.on("createRoom", (socketId, nickname, gameMode, isChallengeOn) => {
    // Generate a new room ID using the uuidv4 function.
    let newUuid = uuidv4()

    // Guarantees non-colliding rooms (even though the chance is infinitely small)
    while (Rooms.Public.has(newUuid) || Rooms.Private.has(newUuid)) {
      newUuid = uuidv4()
    }

    // createRoom() has no knowledge of whether the Room being created is public or private.
    // So, we'll use the gameMode that's being passed in from client to server
    // in order to determine whether it should be a Public or Private game.
    let relevantRooms

    if (gameMode.includes("public")) {
      relevantRooms = Rooms.Public
    }
    //
    else if (gameMode.includes("private")) {
      relevantRooms = Rooms.Private
    }

    // More properties will be added to the Room later in initializeRoom. For now, the Room
    // only needs to contain the info of sockets that join (to display in the WaitingRoom),
    // as well as properties that are relevant to users looking to match and join the Room.
    relevantRooms.set(newUuid, {
      // Nicknames: new Map([[socketId, nickname]]),
      SocketsInfo: new Map(),
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

    console.log(`Creating a new Room with roomId: ${newUuid}`)

    socket.emit("roomCreated", newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid, socketId, nickname, streak) => {
    console.log(`${socket.id} joining room: ${uuid}`)
    console.log(streak)

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
    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
    socketsInfoMap.set(socketId, {
      nickname: nickname,
      streak: streak,
      points: 0,
    })

    // Socket.IO does not emit Maps or Iterators, so we need to convert it to an Array first.
    const socketsInfoArray = Array.from(socketsInfoMap.values())
    io.to(uuid).emit("socketsInfoChanged", socketsInfoArray)

    // In Private Rooms, the host gets to choose when to start the game.
    // However, in Public Rooms, the room will initiate a 10s countdown
    // when 2+ players have been matched.
    if (relevantRooms === Rooms.Public && io.sockets.adapter.rooms.get(uuid).size > 1) {
      console.log(`${socket.id} starting countdown!`)
      startCountdown(uuid)
    }
  })

  // Handle nickname changes
  socket.on("nicknameChange", (uuid, socketId, newNickname) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
    const previousValue = socketsInfoMap.get(socketId)

    socketsInfoMap.set(socketId, {
      ...previousValue,
      nickname: newNickname,
    })
    const socketsInfoArray = Array.from(socketsInfoMap.values())
    io.to(uuid).emit("socketsInfoChanged", socketsInfoArray)
  })

  // Seek match
  socket.on("seekMatch", (isChallengeOn) => {
    // Seeking a match is exclusively a Public Rooms action, so that's what we'll be working with.

    // If there are no Public Rooms, create a new one
    if (Rooms.Public.size === 0) {
      console.log("No Public Rooms found.")
      socket.emit("noMatchesFound")
      return
    }

    // If there are existing Public Rooms, try to find a valid matching room, namely:
    // 1 - the Room must not already be in progress
    // 2 - the Room must not be full (i.e. room size < 4)
    // 3 - the ChallengeOn must match
    const publicRoomsArray = Array.from(Rooms.Public.entries())
    const matchingRoom = publicRoomsArray.find(
      ([roomId, roomObj]) =>
        roomObj.isInGame === false &&
        io.sockets.adapter.rooms.get(roomId).size < 4 &&
        roomObj.isChallengeOn === isChallengeOn
    )

    // If there are no rooms that match the above criteria, create a new Public Room
    if (matchingRoom === undefined) {
      console.log("No Rooms fit the criteria. Creating a new room...")
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
    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
    socketsInfoMap.delete(socket.id)
    const socketsInfoArray = Array.from(socketsInfoMap.values())
    io.to(uuid).emit("socketsInfoChanged", socketsInfoArray)

    cleanupRooms(uuid)

    socket.leave(uuid)

    console.log("From leaveRoom:")
    console.log(Rooms)
  })

  socket.on("initializeRoom", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Altering and adding some more properties to the Room.
    // Each active room will add two additional properties:

    // countGameOvers: the number of players who have gameOver'd,
    // either having guessed correctly or run out of guesses.
    // Will be used as a condition to signal the end of the game in a Private room,
    // since Private rooms continue until all players have finished their game.

    // countOutOfGuesses: the number of players who have run out of guesses.
    // Will be used in conjunction with the countGameOvers to calculate points correctly.
    const previousValue = relevantRooms.get(uuid)
    relevantRooms.set(uuid, {
      ...previousValue,
      isInGame: true,
      countGameOvers: 0,
      countOutOfGuesses: 0,
    })

    socket.emit("roomInitialized", uuid)
  })

  socket.on("startNewOnlineGame", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    // Reset room values.
    relevantRooms.get(uuid).countGameOvers = 0
    relevantRooms.get(uuid).countOutOfGuesses = 0

    /* Generate the required number of Boards as determined by the room.
    Note that for simplicity, just one array of boards (containing all sockets)
    is broadcasted to all the clients. On the client-side, each client will
    sort allBoards to place theirs in front. */

    // Also note that allGameBoards is generated anew every time the call to start a new
    // online game is made. This is intended; if 2 of 4 players leave a private room during a
    // session and the other 2 want to continue playing, only the 2 boards should show then.
    const allGameBoards = []

    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo

    socketsInfoMap.forEach((obj, socketId) => {
      allGameBoards.push({
        socketId: socketId,
        nickname: obj.nickname,
        streak: obj.streak,
        points: obj.points,
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
    io.to(uuid).emit("gameBoardsUpdated", socketId, noLettersBoard)
  })

  // Game Over logic
  socket.on("correctGuess", (socketId, uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    if (relevantRooms === Rooms.Public) {
      // ...
    }
    //
    else if (relevantRooms === Rooms.Private) {
      // Affect the actual value stored in relevantRooms
      relevantRooms.get(uuid).countGameOvers += 1

      // Create variables to make the points calculation more readable
      const roomSize = io.sockets.adapter.rooms.get(uuid).size
      const countOutOfGuesses = relevantRooms.get(uuid).countOutOfGuesses
      const countGameOvers = relevantRooms.get(uuid).countGameOvers

      // Formula to calculate points correctly.
      // ex. in a room of 4 players,
      // if P1 and P2 both get outOfGuesses, P3 should still get 4 points (4 - 2 + 2), not 2.
      const pointsEarned = roomSize - countGameOvers + countOutOfGuesses

      // Update the points in the relevantRooms object (to be tracked as long as the Room persists)
      const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
      const previousValue = socketsInfoMap.get(socketId)
      socketsInfoMap.set(socketId, {
        ...previousValue,
        points: previousValue.points + pointsEarned,
      })

      if (relevantRooms.get(uuid).countGameOvers === io.sockets.adapter.rooms.get(uuid).size) {
        io.to(uuid).emit("gameOver", uuid)
      }
    }

    // if it's Private then the points should update on everyone's screen,
    // and the countGameOvers / outofGuesses etc should be updated, but
    // the game should only truly end when everyone's game is complete.

    io.to(uuid).emit("gameOver", uuid)
  })

  socket.on("outOfGuesses", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    relevantRooms.get(uuid).countGameOvers += 1
    relevantRooms.get(uuid).countOutOfGuesses += 1

    // Edge case: if all players run out of guesses, the game should end.
    if (relevantRooms.get(uuid).countOutOfGuesses === io.sockets.adapter.rooms.get(uuid).size) {
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
