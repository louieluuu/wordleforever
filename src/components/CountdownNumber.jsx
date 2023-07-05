import React, { useEffect, useState } from "react"
import { socket } from "../socket"

function CountdownNumber() {
  const [seconds, setSeconds] = useState("")

  useEffect(() => {
    socket.on("countdownTick", (newSeconds) => {
      setSeconds(newSeconds)
      if (newSeconds === 3) {
        // below won't work because will emit 4 times
        // socket.emit("initializeRoom")
      }
    })
  }, [])

  return <b>{seconds}</b>
}

export default CountdownNumber
