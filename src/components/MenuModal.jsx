import React, { useState } from "react"
import { socket } from "../socket"

function MenuModal({ setIsInGame }) {
  const [showForm, setShowForm] = useState(false)

  function createRoom() {
    const baseUrl = "http://localhost:5173/"

    socket.emit("createRoom")
    socket.on("roomCreated", (roomId) => {
      console.log(`Copy this link to your friend: ${baseUrl}?room=${roomId}`)
    })
  }

  return (
    <div className="menu">
      <h1 className="menu__title">Welcome, Wordler!</h1>
      <button className="menu__btn--online" onClick={createRoom}>
        PLAY ONLINE
      </button>
      <button className="menu__btn--offline" onClick={() => setIsInGame(true)}>
        OFFLINE
      </button>
    </div>
  )
}

export default MenuModal
