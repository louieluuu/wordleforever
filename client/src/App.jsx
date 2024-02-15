import { useState, useEffect } from "react"
import { useMediaQuery } from "react-responsive"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// TODO delete later
import socket from "./socket"
import { auth } from "./firebase"

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

  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState("offline")
  const [gameMode, setGameMode] = useState(
    localStorage.getItem("gameMode") || "normal"
  )

  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || "Wordler"
  )
  const [isHost, setIsHost] = useState(false)
  const [isSpectating, setIsSpectating] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)

  const [roomId, setRoomId] = useState("")

  // Socket.IO initialization
  useEffect(() => {
    socket.on("connect", async () => {
      await new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
          const userId = user ? user.uid : null

          // Set the custom userId property on the client socket object.
          socket.userId = userId ? userId : socket.id
          socket.emit("newConnection", userId)

          console.log(
            `Connected to client with socket.userId: ${socket.userId}`
          )
          resolve()
        })
      })
      setIsSocketConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [])

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
                    displayName={displayName}
                    setDisplayName={setDisplayName}
                    inputWidth={inputWidth}
                    setInputWidth={setInputWidth}
                    isSocketConnected={isSocketConnected}
                    gameMode={gameMode}
                    setGameMode={setGameMode}
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
                    gameMode={gameMode}
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
                    gameMode={gameMode}
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
