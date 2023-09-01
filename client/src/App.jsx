import { useState, useEffect } from "react"

// Socket
import { socket } from "./socket"

// Data

// Components
import Header from "./components/Header"
import WelcomeMessage from "./components/WelcomeMessage"
import ChallengeForm from "./components/ChallengeForm"
import MenuLandingPage from "./components/MenuLandingPage"
import MenuOnlineModes from "./components/MenuOnlineModes"
import MenuOfflineModes from "./components/MenuOfflineModes"
import WaitingRoom from "./components/WaitingRoom"
import Game from "./components/Game"

// Framer-Motion
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

function App() {
  // React-Router
  const navigate = useNavigate()
  const location = useLocation()

  // localStorage stores items as strings, so we use JSON.parse to convert it back to its original type.
  const [isChallengeOn, setIsChallengeOn] = useState(
    JSON.parse(localStorage.getItem("isChallengeOn")) || false
  )

  // * These states are confirmed to belong at the App level
  const [isInGame, setIsInGame] = useState(false) // only used to cond. render Header & Nickname
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "Wordler")
  const [streak, setStreak] = useState(JSON.parse(localStorage.getItem("streak")) || 0)
  const [gameMode, setGameMode] = useState("") // set the game mode upon clicking buttons in the menu,
  // as opposed to when you get in the WaitingRoom.

  // ! Socket states
  const [isHost, setIsHost] = useState(false)

  // ! Socket useEffects
  useEffect(() => {
    socket.on("roomCreated", (roomId) => {
      // Only private rooms require hosts. Public rooms will start on a shared timer.
      if (gameMode === "online-private") {
        setIsHost(true)
      }

      console.log("Navigating to /roomId!")
      navigate(`/room/${roomId}`)
    })

    socket.on("noMatchesFound", () => {
      createRoom("online-public")
    })

    socket.on("matchFound", (roomId) => {
      navigate(`/room/${roomId}`)
    })

    return () => {
      socket.off("roomCreated")
      socket.off("noMatchesFound")
      socket.off("matchFound")
    }
  }, [gameMode]) // TODO: If you don't add gameMode as a dep here, it'll be stale. Wowee

  /*
   * HELPER FUNCTIONS
   */

  function handleNicknameChange(e) {
    const newNickname = e.target.value

    // Enforce nickname length limit
    if (newNickname.length > 20) {
      return
    }

    if (gameMode.includes("online")) {
      socket.emit("nicknameChange", roomId, socket.id, newNickname)
    }

    setNickname(newNickname)
    localStorage.setItem("nickname", newNickname)
  }

  // seekMatch() and leaveRoom() used to exist at the WaitingRoom level,
  // but since the New Game button requires these functions, they have to be out here.

  // A little confusing, but seekMatch can be called from the MenuOnlineModes
  // or by pressing NEW GAME after a Public game ends. In both cases, you are
  // seeking a match. But in the latter case, you are also leaving the Public Room.
  // If there's no roomId passed in, the param will be undefined by default.
  function seekMatch(prevRoomId = undefined) {
    if (prevRoomId !== undefined) {
      leaveRoom(prevRoomId)
    }

    setGameMode("online-public")
    socket.emit("seekMatch", isChallengeOn)
  }

  function createRoom(gameMode) {
    setGameMode(gameMode)
    console.log("Creating room from Client...")
    socket.emit("createRoom", gameMode, isChallengeOn)
  }

  function leaveRoom(roomId) {
    socket.emit("leaveRoom", roomId)
    setGameMode("")
    setIsHost(false)
    setIsInGame(false)
  }

  // TODO: 1. Row and Tile components
  // TODO: 2. Look into Context (stores) so props aren't so ugly
  return (
    <>
      <Header />

      {!isInGame && (
        <>
          <WelcomeMessage nickname={nickname} handleNicknameChange={handleNicknameChange} />
          <ChallengeForm isChallengeOn={isChallengeOn} setIsChallengeOn={setIsChallengeOn} />
        </>
      )}

      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route path="/" element={<MenuLandingPage setIsChallengeOn={setIsChallengeOn} />} />
          <Route
            path="/online"
            element={
              <MenuOnlineModes
                seekMatch={seekMatch}
                createRoom={createRoom}
                setGameMode={setGameMode}
              />
            }
          />
          <Route path="/offline" element={<MenuOfflineModes setGameMode={setGameMode} />} />
          <Route
            path="/offline/classic"
            element={
              <Game
                isHost={isHost}
                gameMode={gameMode}
                nickname={nickname}
                isChallengeOn={isChallengeOn}
                setIsChallengeOn={setIsChallengeOn}
                setIsInGame={setIsInGame}
                streak={streak}
                setStreak={setStreak}
                seekMatch={seekMatch}
              />
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <WaitingRoom
                isHost={isHost}
                setIsHost={setIsHost}
                gameMode={gameMode}
                setGameMode={setGameMode}
                nickname={nickname}
                streak={streak}
                leaveRoom={leaveRoom}
              />
            }
          />
          <Route
            path="/game/:roomId"
            element={
              <Game
                isHost={isHost}
                gameMode={gameMode}
                nickname={nickname}
                isChallengeOn={isChallengeOn}
                setIsChallengeOn={setIsChallengeOn}
                setIsInGame={setIsInGame}
                streak={streak}
                setStreak={setStreak}
                seekMatch={seekMatch}
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
