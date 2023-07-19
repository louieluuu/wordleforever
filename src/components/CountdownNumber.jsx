import React, { useEffect, useState } from "react"
import { socket } from "../socket"

function CountdownNumber() {
  const [seconds, setSeconds] = useState("")

  useEffect(() => {
    socket.on("countdownTick", (newSeconds) => {
      setSeconds(newSeconds)
    })

    return () => {
      socket.off("countdownTick")
    }
  }, [])

  return <b>{seconds}</b>
}

export default CountdownNumber
