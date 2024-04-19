import socket from "../socket"

function handleStartPrivateGame(gameMode, setIsHost) {
  return new Promise((resolve, reject) => {
    socket.emit("createRoom", "private", gameMode)

    socket.on("roomCreated", (roomId) => {
      setIsHost(true)
      resolve(roomId)
    })
  })
}

function handleStartPublicGame(gameMode) {
  return new Promise((resolve, reject) => {
    socket.emit("findMatch", gameMode)

    socket.on("matchFound", (roomId) => {
      handleMatchFound(roomId)
    })
    socket.on("noMatchesFound", () => {
      handleNoMatchesFound(gameMode)
    })
    socket.on("roomCreated", (roomId) => {
      handleRoomCreated(roomId)
    })

    // Helper functions for the socket.on events
    function handleMatchFound(roomId) {
      cleanupAllSocketListeners()
      resolve(roomId)
    }

    function handleNoMatchesFound(gameMode) {
      socket.emit("createRoom", "public", gameMode)
      // TODO: Audit if these two socket.offs are necessary, because the cleanupAllSocketListeners() function is called after this
      socket.off("matchFound")
      socket.off("noMatchesFound")
    }

    function handleRoomCreated(roomId) {
      cleanupAllSocketListeners()
      resolve(roomId)
    }

    function cleanupAllSocketListeners() {
      socket.off("matchFound")
      socket.off("noMatchesFound")
      socket.off("roomCreated")
      socket.off("error")
    }
  })
}

export { handleStartPrivateGame, handleStartPublicGame }
