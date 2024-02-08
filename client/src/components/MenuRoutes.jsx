import React from "react"
import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

// Components
import WelcomeMessage from "./WelcomeMessage"
import MenuLandingPage from "./MenuLandingPage"
import MenuOnlineModes from "./MenuOnlineModes"
import MenuOfflineModes from "./MenuOfflineModes"
import WaitingRoom from "./WaitingRoom"
import ChallengeForm from "./ChallengeForm"

function MenuRoutes({
  displayName,
  setDisplayName,
  inputWidth,
  setInputWidth,
  isChallengeOn,
  setIsChallengeOn,
  connectionMode,
  setConnectionMode,
  isHost,
  setIsHost,
  setIsSpectating,
  roomId,
  setRoomId,
}) {
  return (
    <>
      <WelcomeMessage
        displayName={displayName}
        setDisplayName={setDisplayName}
        inputWidth={inputWidth}
        setInputWidth={setInputWidth}
      />
      {!roomId && (
        <ChallengeForm
          isChallengeOn={isChallengeOn}
          setIsChallengeOn={setIsChallengeOn}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<MenuLandingPage setRoomId={setRoomId} />} />
          <Route
            path="/online"
            element={
              <MenuOnlineModes
                isChallengeOn={isChallengeOn}
                setConnectionMode={setConnectionMode}
                setIsHost={setIsHost}
                setRoomId={setRoomId}
              />
            }
          />
          <Route
            path="/offline"
            element={
              <MenuOfflineModes
                setConnectionMode={setConnectionMode}
                setRoomId={setRoomId}
              />
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <WaitingRoom
                displayName={displayName}
                connectionMode={connectionMode}
                setConnectionMode={setConnectionMode}
                setIsChallengeOn={setIsChallengeOn}
                isHost={isHost}
                setIsHost={setIsHost}
                setIsSpectating={setIsSpectating}
                roomId={roomId}
                setRoomId={setRoomId}
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default MenuRoutes
