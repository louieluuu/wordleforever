import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import socket from "../socket"
import WAITING_ROOM_MESSAGES from "../data/waitingRoomMessages"

// Components
import LobbyCountdownModal from "./LobbyCountdownModal"

function WaitingRoom({
  username,
  connectionMode,
  setConnectionMode,
  setGameMode,
  isHost,
}) {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const [userInfo, setUserInfo] = useState([])
  const [message, setMessage] = useState("")
  const [showLobbyCountdownModal, setShowLobbyCountdownModal] = useState(false)
  const [joinRoom, setJoinRoom] = useState(false)

  // Main useEffect loop
  useEffect(() => {
    if (socket.id === undefined) {
      socket.on("connect", () => {
        setJoinRoom(true)
      })
    } else {
      setJoinRoom(true)
    }

    // Make sure modes are set, important for users joining from a link
    socket.on("roomJoined", (roomConnectionMode, roomGameMode) => {
      setConnectionMode(roomConnectionMode)
      setGameMode(roomGameMode)
    })

    socket.on("failedToJoinRoom", () => {
      // TODO: display some sort of error message for the user
      navigate("/")
    })

    socket.on("matchFound", () => {
      startCountdown()
    })

    socket.on("userInfoUpdated", (updatedUserInfo) => {
      setUserInfo(updatedUserInfo)
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
      socket.off("connect")
      socket.off("roomJoined")
      socket.off("failedToJoinRoom")
      socket.off("matchFound")
      socket.off("userInfoUpdated")
      socket.off("countdownStarted")
      socket.off("countdownTick")
      socket.off("roomStarted")
    }
  }, [])

  // Join room once
  useEffect(() => {
    if (joinRoom) {
      socket.emit("joinRoom", roomId, username)
    }
  }, [joinRoom])

  // Keep username up to date
  useEffect(() => {
    socket.emit("updateUsername", roomId, username)
  }, [username])

  // Keep track of number of users in room
  // Start countdown in public game when at least 2 users, stop when less than 2 users
  useEffect(() => {
    if (
      typeof connectionMode === "string" &&
      connectionMode.includes("public")
    ) {
      if (userInfo.length > 1) {
        startCountdown()
      }
      // Might be a bit hacky since it "should" be < 2, but this was running on the empty first initialized userInfo array when a new user joins in the middle of a countdown
      else if (userInfo.length === 1) {
        stopCountdown()
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
    socket.emit("startCountdown", roomId)
  }

  function stopCountdown() {
    // TODO: display something to the user?
    socket.emit("stopCountdown", roomId)
    setShowLobbyCountdownModal(false)
  }

  function leaveRoom() {
    socket.emit("leaveRoom", roomId)
    navigate("/online")
  }

  function getUsernamesClassName() {
    let usernamesClassName = "waiting-room-usernames"
    if (userInfo && userInfo.length > 0) {
      usernamesClassName += `--${userInfo.length}`
    }
    return usernamesClassName
  }

  return (
    <div>
      <div className="waiting-room-background">
        <h1 className="waiting-message">[{message}]</h1>
        {showLobbyCountdownModal && (
          <LobbyCountdownModal
            setShowLobbyCountdownModal={setShowLobbyCountdownModal}
          />
        )}
        <div className={getUsernamesClassName()}>
          {userInfo.map((user) => (
            <div key={user.userId}>{user.username}</div>
          ))}
        </div>
        <div className="waiting-room-buttons">
          {connectionMode === "online-private" && (
            <>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
              >
                Copy Link
              </button>
              {isHost && (
                <button className="start-btn" onClick={startCountdown}>
                  Start Game
                </button>
              )}
            </>
          )}
          <button className="leave-btn" onClick={leaveRoom}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
