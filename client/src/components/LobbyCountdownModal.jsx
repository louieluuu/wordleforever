import { useState, useEffect } from "react"
import socket from "../socket"

function LobbyCountdownModal({ setShowLobbyCountdownModal }) {
  const [seconds, setSeconds] = useState("")

  useEffect(() => {
    socket.on("countdownTick", (seconds) => {
      setShowLobbyCountdownModal(true)
      setSeconds(seconds)
    })

    return () => {
      socket.off("countdownTick")
    }
  }, [])

  return (
    <div className="lobby-countdown-timer">
      <p>{seconds}</p>
    </div>
  )
}

export default LobbyCountdownModal
