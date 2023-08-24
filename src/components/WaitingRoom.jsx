import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { WAITING_ROOM_MESSAGES } from "../data/waitingRoomMessages"
import { socket } from "../socket"

import CountdownNumber from "./CountdownNumber"
import Streak from "./Streak"

function WaitingRoom({
  isHost,
  gameMode,
  setGameMode,
  setRoomId,
  nickname,
  streak,
  leaveRoom,
  startNewGame,
}) {
  const { roomId } = useParams()
  const [socketsInfo, setSocketsInfo] = useState([])
  const [waitingMessage, setWaitingMessage] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    console.log("useEffect1 activates.")
    // TODO: Not sure if this is "hacky" or not. Scared to put if statements
    // TODO: in useEffect hooks...

    // It might seem redundant, but in the case that the user navigates to the
    // WaitingRoom directly (i.e. received a link from a friend), it's possible
    // to join the room and emit a socket.id before it's actually been defined.

    // So we'll cover both cases. For the above case, we'll wait until the
    // socket's connected using the built-in socket.on("connect").
    // Otherwise, we'll just emit the socket.id immediately.
    if (socket.id === undefined) {
      socket.on("connect", () => {
        socket.emit("joinRoom", roomId, socket.id, nickname, streak)

        // Additionally, a user who navigates directly to the waiting room
        // won't have a gameMode defined. I'm not sure if this practically affects
        // anything, but I'm setting it to "online-private" just in case.
        if (gameMode === "") {
          setGameMode("online-private")
        }
      })
    }
    //
    else {
      console.log(`From client: emit joinRoom on ${roomId}.`)
      socket.emit("joinRoom", roomId, socket.id, nickname, streak)
    }

    socket.on("roomError", (reason) => {
      console.log(`Error: ${reason}`)
    })

    socket.on("socketsInfoChanged", (newSocketsInfo) => {
      setSocketsInfo(newSocketsInfo)
    })

    socket.on("roomCountdownOver", () => {
      startNewGame(gameMode)
    })

    return () => {
      console.log("I'm unmounting!")

      socket.off("connect")
      socket.off("roomError")
      socket.off("socketsInfoChanged")
      socket.off("roomCountdownOver")
    }
  }, [])

  useEffect(() => {
    console.log("useEffect2 activates.")

    console.log(`roomId: ${roomId}`)
    setRoomId(roomId)

    const randomWaitingMessage =
      WAITING_ROOM_MESSAGES[Math.floor(Math.random() * WAITING_ROOM_MESSAGES.length)]
    setWaitingMessage(randomWaitingMessage)
  }, [])

  function copyLink() {
    const baseUrl = "http://localhost:5173"
    const roomLink = `${baseUrl}/room/${roomId}`
    navigator.clipboard.writeText(roomLink)
    setIsCopied(true)
  }

  function cancelRoom() {
    leaveRoom()
    navigate("/online")
  }

  // TODO: This is such a mess :) (to get a border around the flexbox that
  // TODO: doesn't span the whole width...)
  // TODO: Also, index isn't a reliable key - actually need the socket.id
  // TODO: But that's not available in the nicknames array... Lol
  return (
    <div className="flexbox1">
      <div className="flexbox2">
        <div className="flexbox2__countdown">
          <CountdownNumber />
        </div>

        <h1 style={{ fontFamily: "Suwannaphum", color: "hsl(0, 0%, 15%)" }}>[{waitingMessage}]</h1>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>1.&nbsp;&nbsp;</b>
            <button
              className="btn--new-game"
              style={{
                backgroundColor: "hsl(0,0%,90%)",
                borderColor: "hsl(0,0%,85%)",
                color: "black",
                fontWeight: "400",
              }}
              onClick={copyLink}>
              {isCopied ? "LINK COPIED" : "COPY LINK"}
            </button>
          </div>
        )}

        {/* TODO: CSS fix + React map key complaining */}
        <div className="flexbox3">
          {socketsInfo.map((socketInfoObject, index) => (
            <div className="socketInfo">
              <div className="socketInfo__left" key={index}>
                {socketInfoObject.nickname}
              </div>
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              <div className="socketInfo__right" key={index}>
                {socketInfoObject.streak === 0 ? "" : `${socketInfoObject.streak}🔥`}
              </div>
            </div>
          ))}
        </div>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>2.&nbsp;&nbsp;</b>

            <button className="btn--new-game" onClick={() => startNewGame(gameMode)}>
              START GAME
            </button>
          </div>
        )}
        <button
          onClick={cancelRoom}
          style={{
            border: "1px solid black",
            borderRadius: "0.3rem",
            paddingInline: "0.5rem",
            paddingBlock: "0.15rem",
            marginTop: "2rem",
          }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default WaitingRoom
