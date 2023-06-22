import React, { useState } from "react"
import { socket } from "../socket"

function MenuModal() {
  const [showForm, setShowForm] = useState(false)

  function createRoom() {
    socket.emit("createRoom")
    socket.on("returnUuid", (room) => {
      console.log(`copy & paste this code to your friend: ${room}`)
    })
  }

  function joinRoom(e) {
    e.preventDefault()
    const pastedValue = e.clipboardData.getData("text/plain")
    socket.emit("joinRoom", pastedValue)

    socket.on("roomError", (room) => {
      console.log(`Error: Room "${room}" doesn't exist.`)
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
