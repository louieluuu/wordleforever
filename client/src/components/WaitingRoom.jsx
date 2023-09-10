import React, { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"

import { WAITING_ROOM_MESSAGES } from "../data/waitingRoomMessages"
import { socket } from "../socket"

import CountdownNumber from "./CountdownNumber"
import Streak from "./Streak"

function WaitingRoom({ isHost, setIsHost, setGameMode, setRoomId, nickname, streak, leaveRoom }) {
  const navigate = useNavigate()
  const { roomId } = useParams()

  const [socketsInfo, setSocketsInfo] = useState([])
  const [waitingMessage, setWaitingMessage] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  /*
   * USE EFFECTS
   */

  useEffect(() => {
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
        // anything, but I'll set it to "online-private" just in case.
        setGameMode("online-private")
      })
    }
    //
    else {
      socket.emit("joinRoom", roomId, socket.id, nickname, streak)
    }

    // TODO: This should be an Alert instead of a clog.
    socket.on("roomError", (reason) => {
      console.log(`Error: ${reason}`)
    })

    socket.on("socketsInfoChanged", (newSocketsInfo) => {
      setSocketsInfo(newSocketsInfo)
    })

    // In a Public room, one socket gets randomly chosen to be the Host.
    // The Host will eventually send the sole request to the server
    // to start the game in the Game component.
    socket.on("randomPublicHostSelected", () => {
      setIsHost(true)
    })

    socket.on("roomStarted", () => {
      navigate(`/game/${roomId}`)
    })

    return () => {
      socket.off("connect")
      socket.off("roomError")
      socket.off("socketsInfoChanged")
      socket.off("roomCountdownOver")
      socket.off("roomStarted")
    }
  }, [])

  useEffect(() => {
    setRoomId(roomId)

    const randomWaitingMessage =
      WAITING_ROOM_MESSAGES[Math.floor(Math.random() * WAITING_ROOM_MESSAGES.length)]
    setWaitingMessage(randomWaitingMessage)
  }, [])

  /*
   * HELPER FUNCTIONS
   */

  function copyLink() {
    const baseUrl =
      process.env.NODE_ENV === "production" ? "https://wordleforever.com" : "http://localhost:5173"
    const roomLink = `${baseUrl}/room/${roomId}`
    navigator.clipboard.writeText(roomLink)
    setIsCopied(true)
  }

  function startRoom() {
    socket.emit("startRoom", roomId)
  }

  return (
    <div className="outer-container">
      <div className="inner-container">
        <div className="inner-container__countdown">
          <CountdownNumber />
        </div>

        <h1 className="waiting-message">[{waitingMessage}]</h1>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>1.&nbsp;&nbsp;</b>
            <button className="menu__btn--copy" onClick={copyLink}>
              {isCopied ? "LINK COPIED" : "COPY LINK"}
            </button>
          </div>
        )}

        <div className="socket-container">
          {socketsInfo.map((socketInfoObject) => (
            <div className="socket-info" key={socketInfoObject.socketId}>
              <div className="socket-info--left">{socketInfoObject.nickname}</div>
              <div className="socket-info--right">
                {socketInfoObject.streak === 0 ? "" : `${socketInfoObject.streak}🔥`}
              </div>
            </div>
          ))}
        </div>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>2.&nbsp;&nbsp;</b>

            <button className="menu__btn--new-game" onClick={startRoom}>
              START GAME
            </button>
          </div>
        )}
        <Link to="/online">
          <button className="menu__btn--cancel" onClick={() => leaveRoom(roomId)}>
            Cancel
          </button>
        </Link>
      </div>
    </div>
  )
}

export default WaitingRoom
