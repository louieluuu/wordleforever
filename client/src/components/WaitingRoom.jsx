import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"
import useSetRoomId from "../helpers/useSetRoomId"
import WAITING_ROOM_MESSAGES from "../data/waitingRoomMessages"

// Components
import LobbyCountdownModal from "./LobbyCountdownModal"
import AlertModal from "./AlertModal"

function WaitingRoom({
  displayName,
  connectionMode,
  setConnectionMode,
  setIsChallengeOn,
  isHost,
  setIsHost,
  setIsSpectating,
  roomId,
  setRoomId,
}) {
  useSetRoomId(setRoomId)

  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState([])
  const [message, setMessage] = useState("")
  const [showLobbyCountdownModal, setShowLobbyCountdownModal] = useState(false)
  const [joinRoom, setJoinRoom] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const [nonHostMessage, setNonHostMessage] = useState("")
  const [hiddenPeriods, setHiddenPeriods] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)

  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

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
    socket.on("roomJoined", (roomConnectionMode, isChallengeOn) => {
      setConnectionMode(roomConnectionMode)
      setIsChallengeOn(isChallengeOn)
    })

    socket.on("roomJoinedInProgress", (roomConnectionMode, isChallengeOn) => {
      setConnectionMode(roomConnectionMode)
      setIsChallengeOn(isChallengeOn)
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
      console.log("updatedUserInfo", updatedUserInfo)
      console.log("userInfo", userInfo)
    })

    socket.on("newHost", (newHostId) => {
      if (socket.id === newHostId) {
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
      socket.off("connect")
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
    if (joinRoom) {
      socket.emit("joinRoom", roomId, displayName)
    }
  }, [joinRoom])

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
      connectionMode === "online-public" &&
      userInfo.length > 1
    ) {
      startCountdown()
    }
    // Might be a bit hacky since it "should" be < 2, but this was running on the empty first initialized userInfo array when a new user joins in the middle of a countdown
    if (userInfo.length === 1) {
      stopCountdown()
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

  // Cycle through trailing periods
  useEffect(() => {
    const cycle = setInterval(() => {
      setMessageIndex((prevMessageIndex) => (prevMessageIndex + 1) % 4)
    }, 1000)

    return () => clearInterval(cycle)
  }, [])

  // Set non host message and corresponding remaining periods (which are hidden for styling)
  useEffect(() => {
    setNonHostMessage(NON_HOST_MESSAGES[messageIndex])
    setHiddenPeriods(HIDDEN_PERIODS[messageIndex])
  }, [messageIndex])

  const NON_HOST_MESSAGES = [
    "Waiting for host",
    "Waiting for host.",
    "Waiting for host..",
    "Waiting for host...",
  ]

  const HIDDEN_PERIODS = ["...", "..", ".", ""]

  function startCountdown() {
    if (userInfo.length < 2) {
      setAlertMessage("Need at least 2 players to start a room")
      setShowAlertModal(true)
    } else {
      socket.emit("startCountdown", roomId)
    }
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

      {connectionMode === "online-private" && isHost && (
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
          <div key={user.userId}>
            {user.displayName}
            {connectionMode === "online-public" && user.currStreak !== 0 && (
              <span> &nbsp;&nbsp;{user.currStreak}🔥 </span>
            )}
          </div>
        ))}
      </div>

      {connectionMode === "online-private" && (
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
                className="menu__btn--start-game"
                onClick={startCountdown}
              >
                START GAME
              </button>
            </div>
          ) : (
            !showLobbyCountdownModal && (
              <div className="non-host-waiting-message">
                {nonHostMessage}
                <span className="hidden-periods">{hiddenPeriods}</span>
              </div>
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
