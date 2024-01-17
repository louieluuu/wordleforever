import { useState } from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Components
import NavBar from "./components/NavBar"
import GameContainer from "./components/GameContainer"
import MenuRoutes from "./components/MenuRoutes"

function App() {
  const [connectionMode, setConnectionMode] = useState("offline")
  // localStorage stores items as strings, so we use JSON.parse to convert it back to its original type.
  const [isChallengeOn, setIsChallengeOn] = useState(
    JSON.parse(localStorage.getItem("isChallengeOn")) || false
  )

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Wordler"
  )
  const [isHost, setIsHost] = useState(false)
  const [isSpectating, setIsSpectating] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)

  return (
    <>
      <div className="full-page">
        <NavBar />
        <Router>
          <Routes>
            <Route
              path="/*"
              element={
                <MenuRoutes
                  username={username}
                  setUsername={setUsername}
                  inputWidth={inputWidth}
                  setInputWidth={setInputWidth}
                  isChallengeOn={isChallengeOn}
                  setIsChallengeOn={setIsChallengeOn}
                  connectionMode={connectionMode}
                  setConnectionMode={setConnectionMode}
                  isHost={isHost}
                  setIsHost={setIsHost}
                  setIsSpectating={setIsSpectating}
                />
              }
            />

            <Route
              path="/game/:roomId"
              element={
                <GameContainer
                  username={username}
                  isChallengeOn={isChallengeOn}
                  connectionMode={connectionMode}
                  isHost={isHost}
                  setIsHost={setIsHost}
                  isSpectating={isSpectating}
                  setIsSpectating={setIsSpectating}
                />
              }
            />
            <Route
              path="/offline/classic"
              element={
                <GameContainer
                  username={username}
                  isChallengeOn={isChallengeOn}
                  connectionMode={connectionMode}
                  isHost={isHost}
                  setIsHost={setIsHost}
                  setIsSpectating={setIsSpectating}
                />
              }
            />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
