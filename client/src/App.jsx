import { useState } from "react"
import { useMediaQuery } from "react-responsive"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Components
import NavBar from "./components/NavBar"
import GameContainer from "./components/GameContainer"
import MenuRoutes from "./components/MenuRoutes"

import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ResetPasswordPage from "./components/ResetPasswordPage"

function App() {
  // I'd rather pull the breakpoints from "../styles/_variables.scss", think you can do it with webpack but going to skip it for now
  const breakpointSm = "640px"
  const isPhoneLayout = useMediaQuery({ maxWidth: breakpointSm })

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
          <NavBar roomId={roomId} isPhoneLayout={isPhoneLayout} />
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
                    isChallengeOn={isChallengeOn}
                    connectionMode={connectionMode}
                    isHost={isHost}
                    setIsHost={setIsHost}
                    isSpectating={isSpectating}
                    setIsSpectating={setIsSpectating}
                    setRoomId={setRoomId}
                    isPhoneLayout={isPhoneLayout}
                  />
                }
              />
              <Route
                path="/offline/classic"
                element={
                  <GameContainer
                    isChallengeOn={isChallengeOn}
                    connectionMode={connectionMode}
                    isHost={isHost}
                    setIsHost={setIsHost}
                    setIsSpectating={setIsSpectating}
                    setRoomId={setRoomId}
                    isPhoneLayout={isPhoneLayout}
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
