import React, { useState } from "react"
import { socket } from "../socket"

function MenuModal() {
  const [showForm, setShowForm] = useState(false)

  function createRoom() {
    socket.emit("createRoom")
    socket.on("roomCreated", (roomId) => {
      console.log(`copy & paste this code to your friend: ${roomId}`)
    })
  }

  function joinRoom(e) {
    e.preventDefault()
    const pastedId = e.clipboardData.getData("text/plain")
    socket.emit("joinRoom", pastedId)

    socket.on("roomError", (roomId) => {
      console.log(`Error: Room "${roomId}" doesn't exist.`)
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
