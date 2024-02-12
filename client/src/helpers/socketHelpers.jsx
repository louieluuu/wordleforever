import socket from "../socket"

function handleStartPrivateGame(isChallengeOn, setIsHost) {
  return new Promise((resolve, reject) => {
    socket.emit("createRoom", "private", isChallengeOn)

    socket.on("roomCreated", (roomId) => {
      setIsHost(true)
      resolve(roomId)
    })

    socket.on("error", reject)
    setTimeout(() => reject(new Error("Timeout")), 5000)
  })
}

function handleStartPublicGame(isChallengeOn) {
  return new Promise((resolve, reject) => {
    socket.emit("findMatch", isChallengeOn)

    socket.on("matchFound", (roomId) => {
      handleMatchFound(roomId)
    })
    socket.on("noMatchesFound", () => {
      handleNoMatchesFound(isChallengeOn)
    })
    socket.on("roomCreated", (roomId) => {
      handleRoomCreated(roomId)
    })
    socket.on("error", reject)
    setTimeout(() => reject(new Error("Timeout")), 5000)

    function handleMatchFound(roomId) {
      cleanupAllSocketListeners()
      resolve(roomId)
    }

    function handleNoMatchesFound(isChallengeOn) {
      socket.emit("createRoom", "public", isChallengeOn)
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
