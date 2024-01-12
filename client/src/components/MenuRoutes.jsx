import React from "react"
import { Routes, Route, useParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

// Components
import WelcomeMessage from "./WelcomeMessage"
import MenuLandingPage from "./MenuLandingPage"
import MenuOnlineModes from "./MenuOnlineModes"
import MenuOfflineModes from "./MenuOfflineModes"
import WaitingRoom from "./WaitingRoom"
import ChallengeForm from "./ChallengeForm"

function MenuRoutes({
  username,
  setUsername,
  inputWidth,
  setInputWidth,
  isChallengeOn,
  setIsChallengeOn,
  connectionMode,
  setConnectionMode,
  isHost,
  setIsHost,
}) {
  const roomId = useParams()["*"]

  return (
    <>
      <WelcomeMessage
        username={username}
        setUsername={setUsername}
        inputWidth={inputWidth}
        setInputWidth={setInputWidth}
      />
      {!roomId.includes("room") && (
        <ChallengeForm
          isChallengeOn={isChallengeOn}
          setIsChallengeOn={setIsChallengeOn}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<MenuLandingPage />} />
          <Route
            path="/online"
            element={
              <MenuOnlineModes
                isChallengeOn={isChallengeOn}
                setConnectionMode={setConnectionMode}
                setIsHost={setIsHost}
              />
            }
          />
          <Route
            path="/offline"
            element={<MenuOfflineModes setConnectionMode={setConnectionMode} />}
          />
          <Route
            path="/room/:roomId"
            element={
              <WaitingRoom
                username={username}
                connectionMode={connectionMode}
                setConnectionMode={setConnectionMode}
                setIsChallengeOn={setIsChallengeOn}
                isHost={isHost}
                setIsHost={setIsHost}
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default MenuRoutes
