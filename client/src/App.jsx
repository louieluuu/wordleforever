import { useState } from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import useSetRoomId from "./helpers/useSetRoomId"

// Components
import NavBar from "./components/NavBar"
import GameContainer from "./components/GameContainer"
import MenuRoutes from "./components/MenuRoutes"

import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ResetPasswordPage from "./components/ResetPasswordPage"

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

  const [roomId, setRoomId] = useState("")

  return (
    <>
      <Router>
        <div className="full-page">
          <NavBar roomId={roomId} />
          <div className="page-content">
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
                    roomId={roomId}
                    setRoomId={setRoomId}
                  />
                }
              />
              <Route
                path="/login"
                element={<LoginPage setRoomId={setRoomId} />}
              />
              <Route
                path="/register"
                element={<RegisterPage setRoomId={setRoomId} />}
              />
              <Route
                path="/forgot"
                element={<ResetPasswordPage setRoomId={setRoomId} />}
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
                    setRoomId={setRoomId}
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
                    setRoomId={setRoomId}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  )
}

export default App
