import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { socket } from "../socket"

function WaitingRoom({ setIsMultiplayer, setRoom, nickname }) {
  const { roomId } = useParams()
  // TODO: WaitingRoom and RoomModal both have nicknames states..... LUL
  const [nicknames, setNicknames] = useState([])

  // Update names as people join
  useEffect(() => {
    socket.on("nicknamesChanged", (newNicknames) => {
      setNicknames(newNicknames)
    })
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")
      console.log(roomId)

      socket.emit("joinRoom", roomId, socket.id, nickname)
      setIsMultiplayer(true)
      setRoom(roomId)

      socket.on("roomError", (reason) => {
        console.log(`Error: ${reason}`)
      })

      socket.on("nicknamesChanged", (newNicknames) => {
        setNicknames(newNicknames)
      })
    })
  })

  return (
    <>
      <h1>These bitches better be ready...</h1>
      {nicknames.map((nickname) => (
        <p>{nickname}</p>
      ))}
    </>
  )
}

export default WaitingRoom
