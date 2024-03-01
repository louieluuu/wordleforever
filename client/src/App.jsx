import { useState, useEffect } from "react"
import { useMediaQuery } from "react-responsive"

import socket from "./socket"
import { auth } from "./firebase"

import { MantineProvider } from "@mantine/core"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Components
import NavBar from "./components/NavBar"
import GameContainer from "./components/GameContainer"
import MenuRoutes from "./components/MenuRoutes"

import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ResetPasswordPage from "./components/ResetPasswordPage"
import StatsPage from "./components/StatsPage"

// Global variables
// Configuration (needed on client side -> used in GameContainer, displayed in WaitingRoom)
// Rest of configuration is in WaitingRoom as it isn't needed for client side logic (doesn't need to be passed into GameContainer)
const DEFAULT_GAME_MODE = "normal"
const DEFAULT_LETTER_ELIMINATION = true

function App() {
  // I'd rather pull the breakpoints from "../styles/_variables.scss", think you can do it with webpack but going to skip it for now
  const breakpointSm = "640px"
  const isPhoneLayout = useMediaQuery({ maxWidth: breakpointSm })

  const [isFirstTimeVisitor, setIsFirstTimeVisitor] = useState(
    JSON.parse(localStorage.getItem("isFirstTimeVisitor")) === false
      ? false
      : true
  )
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState("offline")
  const [gameMode, setGameMode] = useState(DEFAULT_GAME_MODE)
  const [isLetterEliminationOn, setIsLetterEliminationOn] = useState(
    DEFAULT_LETTER_ELIMINATION
  )

  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || "Wordler"
  )
  const [isHost, setIsHost] = useState(false)
  const [isSpectating, setIsSpectating] = useState(false)

  // TODO: Shouldn't this be local to WelcomeMessage?
  const [inputWidth, setInputWidth] = useState(0)

  const [roomId, setRoomId] = useState("")

  useEffect(() => {
    const storedGameMode = localStorage.getItem("gameMode")
    if (storedGameMode === "challenge" || storedGameMode === "normal") {
      setGameMode(storedGameMode)
    }

    const storedIsLetterEliminationOn = localStorage.getItem(
      "isLetterEliminationOn"
    )
    if (
      storedIsLetterEliminationOn === "true" ||
      storedIsLetterEliminationOn === "false"
    ) {
      setIsLetterEliminationOn(storedIsLetterEliminationOn === "true")
    }
  }, [])

  // Tutorial for first time visitors
  useEffect(() => {
    if (isFirstTimeVisitor) {
      function handleClick() {
        setIsFirstTimeVisitor(false)
        localStorage.setItem("isFirstTimeVisitor", false)
      }

      document.addEventListener("click", handleClick)

      return () => {
        document.removeEventListener("click", handleClick)
      }
    }
  }, [])

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
    <MantineProvider>
      <Router>
        <div className="full-page">
          <NavBar roomId={roomId} isPhoneLayout={isPhoneLayout} />
          <div className="page-content">
            <Routes>
              <Route
                path="/*"
                element={
                  <MenuRoutes
                    isFirstTimeVisitor={isFirstTimeVisitor}
                    displayName={displayName}
                    setDisplayName={setDisplayName}
                    inputWidth={inputWidth}
                    setInputWidth={setInputWidth}
                    isSocketConnected={isSocketConnected}
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    isLetterEliminationOn={isLetterEliminationOn}
                    setIsLetterEliminationOn={setIsLetterEliminationOn}
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
              <Route path="/user" element={<StatsPage />} />
              <Route
                path="/game/:roomId"
                element={
                  <GameContainer
                    gameMode={gameMode}
                    isLetterEliminationOn={isLetterEliminationOn}
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
    </MantineProvider>
  )
}

export default App
