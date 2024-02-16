import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"

import useSetRoomId from "../helpers/useSetRoomId"
import WAITING_ROOM_MESSAGES from "../data/waitingRoomMessages"
import Checkmark from "../assets/checkmark.svg?react"

// Components
import LobbyCountdownModal from "./LobbyCountdownModal"
import AlertModal from "./AlertModal"

function WaitingRoom({
  displayName,
  isSocketConnected,
  connectionMode,
  setConnectionMode,
  setGameMode,
  isHost,
  setIsHost,
  setIsSpectating,
  roomId,
  setRoomId,
}) {
  useSetRoomId(setRoomId)

  const navigate = useNavigate()
  const [joinRoom, setJoinRoom] = useState(false)
  const [userInfo, setUserInfo] = useState([])
  const [message, setMessage] = useState("")
  const [showLobbyCountdownModal, setShowLobbyCountdownModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [allPlayersReady, setAllPlayersReady] = useState(false)

  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Main useEffect loop
  useEffect(() => {
    setJoinRoom(true)
    // Make sure modes are set, important for users joining from a link
    socket.on("roomJoined", (roomConnectionMode, gameMode) => {
      setConnectionMode(roomConnectionMode)
      setGameMode(gameMode)
    })

    socket.on("roomJoinedInProgress", (roomConnectionMode, gameMode) => {
      setConnectionMode(roomConnectionMode)
      setGameMode(gameMode)
      setIsSpectating(true)
      navigate(`/game/${roomId}`)
    })

    socket.on("roomFull", () => {
      // TODO: display some sort of error message for the user
      navigate("/")
    })

    socket.on("matchFound", () => {
      startCountdown()
    })

    socket.on("roomUserInfoUpdated", (updatedUserInfo) => {
      setUserInfo(updatedUserInfo)
    })

    socket.on("newHost", (newHostId) => {
      if (socket.userId === newHostId) {
        setIsHost(true)
      }
    })

    socket.on("countdownStarted", () => {
      setShowLobbyCountdownModal(true)
    })

    socket.on("countdownTick", () => {
      setShowLobbyCountdownModal(true)
    })

    socket.on("roomStarted", () => {
      navigate(`/game/${roomId}`)
    })

    return () => {
      socket.off("roomJoined")
      socket.off("roomFull")
      socket.off("matchFound")
      socket.off("userInfoUpdated")
      socket.off("countdownStarted")
      socket.off("countdownTick")
      socket.off("roomStarted")
    }
  }, [roomId])

  // Join room once
  useEffect(() => {
    if (isSocketConnected && roomId && joinRoom) {
      socket.emit("joinRoom", roomId, displayName)
    }
  }, [isSocketConnected, roomId, joinRoom])

  // TODO: Don't like this placement here, I think it should belong with nicknameform.
  // Keep displayName up to date
  useEffect(() => {
    socket.emit("updateDisplayName", roomId, displayName)
  }, [displayName])

  // Keep track of number of users in room
  // Start countdown in public game when at least 2 users, stop countdown for both private/public when less than 2 users
  useEffect(() => {
    if (
      typeof connectionMode === "string" &&
      connectionMode === "public" &&
      userInfo.length > 1
    ) {
      startCountdown()
    }
    // Might be a bit hacky since it "should" be < 2, but this was running on the empty first initialized userInfo array when a new user joins in the middle of a countdown
    if (userInfo.length === 1 && showLobbyCountdownModal) {
      userUnreadyUp()
      setAllPlayersReady(false)
      stopCountdown()
    }
  }, [userInfo])

  // TODO: check if this should be merged with the above useEffect as they both only have the one dependency on userInfo, or is it okay to keep it more "readable" with 2 blocks
  // Check if all players are ready in a private room
  useEffect(() => {
    if (userInfo.length >= 2) {
      let playersReady = 0
      userInfo.forEach((obj) => {
        if (socket.userId && socket.userId !== obj.userId && obj.isReady) {
          playersReady += 1
        }
      })
      if (playersReady >= userInfo.length - 1) {
        setAllPlayersReady(true)
      } else {
        setAllPlayersReady(false)
      }
    }
  }, [userInfo])

  // Set random waiting room message when component mounts
  useEffect(() => {
    const randomMessage =
      WAITING_ROOM_MESSAGES[
        Math.floor(Math.random() * WAITING_ROOM_MESSAGES.length)
      ]
    setMessage(randomMessage)
  }, [])

  function startCountdown() {
    if (userInfo.length < 2) {
      setAlertMessage("Need at least 2 players to start a room")
      setShowAlertModal(true)
    } else if (connectionMode === "private" && !allPlayersReady) {
      setAlertMessage("Waiting for all players to ready up")
      setShowAlertModal(true)
    } else {
      userReadyUp()
      socket.emit("startCountdown", roomId)
    }
  }

  function stopCountdown() {
    // TODO: display something to the user?
    socket.emit("stopCountdown", roomId)
    setShowLobbyCountdownModal(false)
  }

  function userReadyUp() {
    socket.emit("userReadyUp", roomId)
    setIsReady(true)
  }

  function userUnreadyUp() {
    socket.emit("userUnreadyUp", roomId)
    setIsReady(false)
  }

  function toggleUserReady() {
    if (isReady) {
      userUnreadyUp()
    } else {
      userReadyUp()
    }
  }

  function leaveRoom() {
    socket.emit("leaveRoom", roomId)
    navigate("/online")
  }

  // TODO: what is this for? (Thomas' relic)
  function getUsernamesClassName() {
    let usernamesClassName = "waiting-room-user-info"
    if (userInfo && userInfo.length > 0) {
      usernamesClassName += `--${userInfo.length}`
    }
    return usernamesClassName
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
  }

  return (
    <div className="waiting-room-background">
      <h1 className="waiting-message">[{message}]</h1>

      {showLobbyCountdownModal && (
        <LobbyCountdownModal
          setShowLobbyCountdownModal={setShowLobbyCountdownModal}
        />
      )}

      <AlertModal
        showAlertModal={showAlertModal}
        setShowAlertModal={setShowAlertModal}
        message={alertMessage}
        inGame={false}
      />

      {connectionMode === "private" && isHost && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <b style={{ fontWeight: 900 }}>1.&nbsp;&nbsp;</b>
          <button className="menu__btn--copy" onClick={copyLink}>
            {isCopied ? "LINK COPIED" : "COPY LINK"}
          </button>
        </div>
      )}

      <div className="waiting-room-user-info">
        {userInfo.map((user) => (
          <div key={user.userId} className="waiting-room-user-line">
            {connectionMode === "private" &&
              (user.isReady ? (
                <div className="checkmark__ready">
                  <Checkmark />
                </div>
              ) : (
                <div className="checkmark__not-ready">
                  <Checkmark />
                </div>
              ))}
            {user.displayName}
            {connectionMode === "public" && user.currStreak !== 0 && (
              <span> &nbsp;&nbsp;{user.currStreak}🔥 </span>
            )}
          </div>
        ))}
      </div>

      {connectionMode === "private" && (
        <>
          {isHost ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <b style={{ fontWeight: 900 }}>2.&nbsp;&nbsp;</b>
              <button
                className={`menu__btn--start-game${
                  !allPlayersReady ? " unclickable" : ""
                }`}
                onClick={startCountdown}
              >
                START GAME
              </button>
            </div>
          ) : (
            !showLobbyCountdownModal && (
              <button
                className={`menu__btn--${isReady ? "unready" : "ready"}`}
                onClick={toggleUserReady}
              >
                {isReady ? "UNREADY" : "READY"}
              </button>
            )
          )}
        </>
      )}

      <button className="menu__btn--cancel" onClick={leaveRoom}>
        Cancel
      </button>
    </div>
  )
}

export default WaitingRoom
