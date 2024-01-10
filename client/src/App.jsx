import { useState } from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Components
import NavBar from "./components/NavBar"
import GameContainer from "./components/GameContainer"
import MenuRoutes from "./components/MenuRoutes"

function App() {
  const [gameMode, setGameMode] = useState("Easy")
  const [connectionMode, setConnectionMode] = useState("offline")

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Wordler"
  )
  const [isHost, setIsHost] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)

  return (
    <>
      <Router>
        <NavBar
          setGameMode={setGameMode}
          setConnectionMode={setConnectionMode}
        />
        <Routes>
          <Route
            path="/*"
            element={
              <MenuRoutes
                username={username}
                setUsername={setUsername}
                inputWidth={inputWidth}
                setInputWidth={setInputWidth}
                gameMode={gameMode}
                setGameMode={setGameMode}
                connectionMode={connectionMode}
                setConnectionMode={setConnectionMode}
                isHost={isHost}
                setIsHost={setIsHost}
              />
            }
          />

          <Route
            path="/game/:roomId"
            element={
              <GameContainer
                username={username}
                gameMode={gameMode}
                connectionMode={connectionMode}
                isHost={isHost}
              />
            }
          />
          <Route
            path="/offline/classic"
            element={
              <GameContainer
                username={username}
                gameMode={gameMode}
                connectionMode={connectionMode}
                isHost={isHost}
              />
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
