import React, { useState } from "react"
import { socket } from "../socket"

function MenuModal() {
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
      <button className="menu__btn" onClick={createRoom}>
        Create
      </button>
      <button className="menu__btn" onClick={() => setShowForm((prev) => !prev)}>
        Join
      </button>

      {showForm && (
        <form onPaste={joinRoom}>
          <label>
            Enter your code here: {""}
            <input autoFocus type="text" />
          </label>
        </form>
      )}
    </div>
  )
}

export default MenuModal
