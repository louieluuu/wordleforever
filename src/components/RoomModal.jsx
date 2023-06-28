import React, { useState } from "react"
import { Dialog } from "@headlessui/react"

import { socket } from "../socket"
import { useEffect } from "react"

// Styles
const flexbox = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}

const nicknamesContainer = {
  ...flexbox,
  fontSize: "0.90rem",
  lineHeight: 0,
  fontWeight: "bold",
}

function RoomModal({ setShowRoomModal, roomId, isChallengeMode }) {
  const [isCopied, setIsCopied] = useState(false)
  const [nicknames, setNicknames] = useState([])

  // Update names as people join
  useEffect(() => {
    socket.on("nicknamesChanged", (newNicknames) => {
      console.log(newNicknames)
      setNicknames(newNicknames)
    })
  }, [])

  function copyLink() {
    const baseUrl = "http://localhost:5173/"
    const roomLink = `${baseUrl}?room=${roomId}`
    navigator.clipboard.writeText(roomLink)
    setIsCopied(true)
  }

  function initializeRoom() {
    socket.emit("initializeRoom", roomId)

    socket.on("roomInitialized", (roomId) => {
      socket.emit("startNewGame", roomId)
      setShowRoomModal(false)
    })
  }

  return (
    <Dialog className="modal" open={true} onClose={() => setShowRoomModal(false)}>
      <Dialog.Panel style={flexbox}>
        <Dialog.Title style={{ fontFamily: "Calistoga" }}>Room created!</Dialog.Title>
        <p>
          <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>1.</span> Send the room link to
          your friends.
        </p>
        <button
          className="btn--new-game"
          style={{
            backgroundColor: "hsl(0,0%,90%)",
            borderColor: "hsl(0,0%,85%)",
            color: "black",
            fontWeight: "400",
          }}
          onClick={copyLink}>
          {isCopied ? "LINK COPIED" : "COPY LINK"}
        </button>
        <br></br>

        <div style={nicknamesContainer}>
          {nicknames.map((nickname) => (
            <p>{nickname}</p>
          ))}
        </div>

        <p>
          <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>2.</span> Start the game when
          you're ready.
        </p>
        <button className="btn--new-game" onClick={initializeRoom}>
          START GAME
        </button>
        <br></br>
        <button
          onClick={() => setShowRoomModal(false)}
          style={{
            border: "1px solid black",
            borderRadius: "0.3rem",
            paddingInline: "0.5rem",
            paddingBlock: "0.15rem",
          }}>
          Cancel
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}

export default RoomModal
