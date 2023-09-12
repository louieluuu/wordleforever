// TODO: don't need to pass in socketId, pretty sure you can just do socket.id

import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Generate uuids, which we'll use as roomIds
import { v4 as uuidv4 } from "uuid"

// Initiating WebSockets using Express
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()
const httpServer = createServer(app)

// Do note that if you want to pass in a CORS_ORIGIN options here, process.env.NODE_ENV
// won't work the same way as it does in the client. You'll have to manually pass it in.
const io = new Server(httpServer, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 20000, // 20s
  },
})

// Global variables

// We split the Rooms into Public and Private, as this is more extensible.
// ex. if we want to display the number of active users in the public online matchmaking mode.
const Public = new Map()
const Private = new Map()

const Rooms = { Public, Private }

const MAX_ROOM_SIZE = 4

/*
 * HELPER FUNCTIONS
 */

// Generates a random solution
function getRandomSolution() {
  const randomSolution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    .toUpperCase()
    .split("")
  console.log(`Solution: ${randomSolution}`)
  return randomSolution
}

// Challenge Mode:
// generates a random starting word that always has exactly one green match
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
      return randomFirstGuess.split("")
    }
  }
}

// Returns whether a roomId holds a Public or Private Room.
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
    console.log("ERROR! ERROR! ERROR!")
    return undefined
  }
}

// Cleans up the Rooms object if a user is the last to leave.
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

// Controls the starting and stopping of a Public Room countdown.
function startCountdown(roomId) {
  let seconds = 5

  const timer = setInterval(() => {
    // If the countdown gets this low, it means that the game should actually be starting.
    if (seconds < 4) {
      // There's one exception: if a player leaves *right* as the countdown is about to end,
      // (i.e. when "4" is on screen) it's possible for the game to start with just
      // 1 player in a Public Room. Therefore, we need an explicit check for room start eligibility
      // in this condition as well, despite that situation being covered below in the else condition.
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId)

      if (socketsInRoom === undefined || socketsInRoom.size === 1) {
        console.log("Enough people have left so the Room can't start! Stopping countdown...")
        io.to(roomId).emit("notEnoughPlayers")
        clearInterval(timer)
        return
      }

      // If we clear that final check, then the game can start.
      // The system here is admittedly scuffed because the countdown is broadcasted
      // to all sockets in the room, but I only want one socket to initialize the room.
      // This wasn't a problem in the private lobbies, because there is no countdown
      // in a private lobby - the host gets to control when to initialize the room.

      // So... I'm just going to pick a random socket in the room to initialize the room.
      const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId))

      // Not sure how this would happen, but...
      if (socketIds.length === 0) {
        console.log("Error: startCountdown() called on invalid roomId")
        return
      }

      const randomSocket = socketIds[Math.floor(Math.random() * socketIds.length)]
      io.to(randomSocket).emit("randomPublicHostSelected")

      io.to(roomId).emit("roomStarted")

      clearInterval(timer)
      return
    }
    //
    else {
      // On each tick, check if the Room has lost eligibility to actually start.
      // (i.e. Rooms.size < 2 due to players leaving.)

      // Note that there is no need to manually delete the Room
      // because cleanupRooms will have already been called.
      // (cleanupRooms is called when the last user leaves the room.)

      const socketsInRoom = io.sockets.adapter.rooms.get(roomId)

      if (socketsInRoom === undefined || socketsInRoom.size === 1) {
        console.log("Enough people have left so the Room can't start! Stopping countdown...")
        io.to(roomId).emit("notEnoughPlayers")
        clearInterval(timer)
        return
      }

      // If the Room is still eligible to start, broadcast the countdown to the room.
      io.to(roomId).emit("countdownTick", seconds)
      seconds -= 1
    }
  }, 1250)
}

/*
 * SOCKET.IO LOGIC
 */

// All server-side socket logic is, by design, wrapped under the io.on("connection") function.
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

    // TODO: Not a perfect implementation; deleting right as the socket
    // TODO: disconnects will lead to the user disappearing mid-game. Only want
    // TODO: the user's board to disappear at the start of a new game.

    // const socketsInfoMap = getPublicOrPrivateRooms(roomId).get(roomId).SocketsInfo
    // socketsInfoMap.delete(socket.id)
  })

  // Create room
  socket.on("createRoom", (gameMode, isChallengeOn) => {
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

    if (gameMode === "online-public") {
      relevantRooms = Rooms.Public
    }
    //
    else if (gameMode === "online-private") {
      relevantRooms = Rooms.Private
    }

    // Initialize properties of the Room.
    relevantRooms.set(newUuid, {
      // SocketsInfo will be used to store any information attached to a socket, i.e.
      // their nickname, streak, points, and gameBoard.
      SocketsInfo: new Map(),

      // These properties will be used as checks for a socket seeking a match.
      isChallengeOn: isChallengeOn,
      isInGame: false,

      // These properties will be used for gameOver logic, as well as
      // calculating points.
      countGameOvers: 0,
      countOutOfGuesses: 0,
    })

    console.log(`Creating a new Room with roomId: ${newUuid}`)

    socket.emit("roomCreated", newUuid)
  })

  // Join room
  socket.on("joinRoom", (uuid, socketId, nickname, streak) => {
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

    if (
      io.sockets.adapter.rooms.get(uuid) !== undefined &&
      io.sockets.adapter.rooms.get(uuid).size === MAX_ROOM_SIZE
    ) {
      const reason = "This room is full."
      socket.emit("roomError", reason)
      return
    }

    console.log(`${socket.id} joining room: ${uuid}`)

    // Add user to room
    socket.join(uuid)
    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
    socketsInfoMap.set(socketId, {
      nickname: nickname,
      streak: streak,
      points: 0,
      gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })),
    })

    // Socket.IO does not emit Maps or Iterators, so we need to convert it to an Array first.
    // When we .map() this information on the client-side, we'll need a unique key (React).
    // So we'll transmit an Object consisting of socketId, nickname, and streak.
    // The other 2 properties (points and gameBoard) are not needed for rendering the lobby.

    // The syntax below is a bit confusing, here's a step-by-step:
    // socketsInfoMap.entries() returns an Iterator that looks like this: [key, value]
    // We create a callback function that takes in that Iterator, and returns an Object
    // with the desired properties. Each element of the Array is an Object.
    // Finally, we convert the Iterator to an Array using Array.from() for transmission.
    const socketsInfoArray = Array.from(socketsInfoMap.entries(), ([socketId, obj]) => ({
      socketId: socketId,
      nickname: obj.nickname,
      streak: obj.streak,
    }))
    io.to(uuid).emit("socketsInfoChanged", socketsInfoArray)

    // In Private Rooms, the host gets to choose when to start the game.
    // However, in Public Rooms, the room will initiate a 10s countdown
    // when exactly 2 players have been matched.

    // Note that the condition is exactly 2 players, not > 1 for example. We only want
    // the countdown to start once. If a third player joins, the countdown should not restart.
    if (relevantRooms === Rooms.Public && io.sockets.adapter.rooms.get(uuid).size == 2) {
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
        io.sockets.adapter.rooms.get(roomId).size < MAX_ROOM_SIZE &&
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

  // Start room
  socket.on("startRoom", (uuid) => {
    io.to(uuid).emit("roomStarted")
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

  socket.on("startNewOnlineGame", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    relevantRooms.get(uuid).isInGame = true

    // Reset room values.
    relevantRooms.get(uuid).countGameOvers = 0
    relevantRooms.get(uuid).countOutOfGuesses = 0

    /* Generate the required number of Boards as determined by the room.
    Note that for simplicity, just one array of boards (containing all sockets)
    is broadcasted to all the clients. On the client-side, each client will
    sort allBoards to place theirs in front. */

    // TODO: This isn't working upon disconnect for some reason.
    // Also note that allGameBoards is generated anew every time the call to start a new
    // online game is made. This is intended; if 2 of 4 players leave a private room during a
    // session and the other 2 want to continue playing, only the 2 boards should show then.
    const allGameBoards = []

    const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo

    // Note that the gameBoard isn't being borrowed from obj.gameBoard; that's because upon
    // starting a new game, the gameBoard should be reset to an empty board. However,
    // the other information should be preserved.
    // ex. Private Room -> points should be taken from the previous games.
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
      allGameBoards,
      solution,
      relevantRooms.get(uuid).isChallengeOn,
      challengeModeGuess
    )
  })

  socket.on("wrongGuess", (socketId, uuid, newGameBoard) => {
    // Update the corresponding gameBoard in the Room. This will become useful later,
    // when the game ends and all boards must be displayed to all users.
    // By updating the socketsInfoMap, we have one source that we can reference
    // to get the gameBoard of each socket.
    const socketsInfoMap = getPublicOrPrivateRooms(uuid).get(uuid).SocketsInfo
    const previousValue = socketsInfoMap.get(socketId)

    socketsInfoMap.set(socketId, {
      ...previousValue,
      gameBoard: newGameBoard,
    })

    // Process the board to hide the letters but still display the colors.
    // Then, show that noLettersBoard to the other users.
    const noLettersBoard = newGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
    const pointsEarned = 0

    // TODO: Now that we're rendering our own gameBoard separately, (...)
    // All clients are specially rendering their own gameBoard, so it's not necessary to
    // broadcast gameBoard to the socket that made the wrong guess. It would work with
    // io.to(uuid).emit as well, but this is more explicit.
    io.to(uuid).emit("gameBoardsUpdated", socketId, noLettersBoard, null, pointsEarned)
  })

  socket.on("correctGuess", (correctGuessSocketId, uuid, newGameBoard) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    if (relevantRooms === Rooms.Public) {
      const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo

      // Update streaks for all players. The player who guessed correctly gets +1,
      // while all other players get reset to 0.
      // Additionally, update the gameBoard for the player who guessed correctly.
      socketsInfoMap.forEach((previousValue, socketId) => {
        if (socketId === correctGuessSocketId) {
          socketsInfoMap.set(socketId, {
            ...previousValue,
            streak: previousValue.streak + 1,
            gameBoard: newGameBoard,
          })
        }
        //
        else {
          socketsInfoMap.set(socketId, {
            ...previousValue,
            streak: 0,
          })
        }
      })

      // Emit an event to the losers to get them to set their streak state to 0.
      socket.to(uuid).emit("loseStreak")

      // Always end the game upon the first correctGuess in a Public Room.
      io.to(uuid).emit("gameOver", uuid)
    }

    //
    else if (relevantRooms === Rooms.Private) {
      // Create variables to make the points calculation more readable
      const roomSize = io.sockets.adapter.rooms.get(uuid).size
      const countOutOfGuesses = relevantRooms.get(uuid).countOutOfGuesses
      const countGameOvers = relevantRooms.get(uuid).countGameOvers

      // Formula to calculate points correctly.
      // ex. in a room of 4 players,
      // if P1 and P2 both get outOfGuesses, P3 should still get 4 points (4 - 2 + 2), not 2.
      const pointsEarned = roomSize - countGameOvers + countOutOfGuesses

      // Update the points in the relevantRooms object (to be tracked as long as the Room persists)
      // and also update the gameBoard.
      const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
      const previousValue = socketsInfoMap.get(correctGuessSocketId)
      socketsInfoMap.set(correctGuessSocketId, {
        ...previousValue,
        points: previousValue.points + pointsEarned,
        gameBoard: newGameBoard,
      })

      // After updating the server-side, broadcast the new information so clients can render it.

      // Process the board to hide the letters but still display the colors.
      // Then, show that noLettersBoard to the other users.
      const noLettersBoard = newGameBoard.map((row) => row.map((tile) => ({ ...tile, letter: "" })))
      io.to(uuid).emit(
        "gameBoardsUpdated",
        correctGuessSocketId,
        noLettersBoard,
        null,
        pointsEarned
      )

      // Update countGameOvers after the points have been calculated.
      relevantRooms.get(uuid).countGameOvers += 1

      // Only display a winning message to the first solver in a Private Room.
      if (relevantRooms.get(uuid).countGameOvers === 1) {
        socket.emit("firstSolve")
      }

      // Only end the game if all players have finished in a Private Room.
      if (relevantRooms.get(uuid).countGameOvers === io.sockets.adapter.rooms.get(uuid).size) {
        console.log("Private room done")
        io.to(uuid).emit("gameOver", uuid)
      }
    }
  })

  socket.on("outOfGuesses", (uuid) => {
    const relevantRooms = getPublicOrPrivateRooms(uuid)

    relevantRooms.get(uuid).countGameOvers += 1
    relevantRooms.get(uuid).countOutOfGuesses += 1

    if (relevantRooms === Public) {
      socket.emit("loseStreak")

      const socketsInfoMap = relevantRooms.get(uuid).SocketsInfo
      const previousValue = socketsInfoMap.get(socket.id)

      socketsInfoMap.set(socket.id, {
        ...previousValue,
        streak: 0,
      })

      const noLettersBoard = previousValue.gameBoard.map((row) =>
        row.map((tile) => ({ ...tile, letter: "" }))
      )

      io.to(uuid).emit("gameBoardsUpdated", socket.id, noLettersBoard, 0, null)
    }

    // Edge case: if the last player in the Room runs out of guesses, the game should end.
    if (relevantRooms.get(uuid).countGameOvers === io.sockets.adapter.rooms.get(uuid).size) {
      io.to(uuid).emit("gameOver", uuid)
    }
  })

  socket.on("revealFinalGameBoards", (uuid) => {
    // Throughout the rest of the server, socketsInfoMap is being updated
    // as guesses are emitted from the client. The information in socketsInfoMap,
    // namely scoring and gameBoards, is accurate when the game ends.

    // Therefore, similar to how allGameBoards is created in the beginning of the game,
    // we'll use the accurate information from socketsInfoMap to build and emit a
    // "finalGameBoards" array, which clients will .sort() to display their own board first.

    const finalGameBoards = []

    const socketsInfoMap = getPublicOrPrivateRooms(uuid).get(uuid).SocketsInfo

    socketsInfoMap.forEach((obj, socketId) => {
      finalGameBoards.push({
        socketId: socketId,
        nickname: obj.nickname,
        streak: obj.streak,
        points: obj.points,
        gameBoard: obj.gameBoard,
      })
    })

    io.to(uuid).emit("finalGameBoardsRevealed", finalGameBoards)
  })
})

// In development, this PORT has to be different from the client port.
// Through experiments, it also can't be 443 during production stage.
const PORT = 3005

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
