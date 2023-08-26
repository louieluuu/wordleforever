import React, { useEffect, useState } from "react"
import { socket } from "../socket"

function CountdownNumber() {
  const [seconds, setSeconds] = useState("")
  const [enoughPlayers, setEnoughPlayers] = useState(true)

  useEffect(() => {
    socket.on("countdownTick", (newSeconds) => {
      setEnoughPlayers(true)
      setSeconds(newSeconds)
    })

    socket.on("notEnoughPlayers", () => {
      setEnoughPlayers(false)
    })

    return () => {
      socket.off("countdownTick")
      socket.off("notEnoughPlayers")
    }
  }, [])

  return <b>{enoughPlayers && seconds}</b>
}

export default CountdownNumber
