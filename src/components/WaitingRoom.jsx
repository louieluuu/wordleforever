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

  // TODO: This is such a mess :) (to get a border around the flexbox that
  // TODO: doesn't span the whole width...)
  return (
    <div className="flexbox1">
      <div className="flexbox2">
        <h1 style={{ fontFamily: "Suwannaphum", color: "hsl(0, 0%, 15%)" }}>
          a battle is surely brewing...
        </h1>
        <div className="flexbox3">
          {nicknames.map((nickname) => (
            <p>{nickname}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
