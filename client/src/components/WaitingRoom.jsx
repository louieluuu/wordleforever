import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import socket from "../socket"

import useSetRoomId from "../helpers/useSetRoomId"
import WAITING_ROOM_MESSAGES from "../data/waitingRoomMessages"
import Checkmark from "../assets/checkmark.svg?react"
import { FaGear } from "react-icons/fa6"
import { FaArrowLeft } from "react-icons/fa"

// Components
import LobbyCountdownModal from "./LobbyCountdownModal"
import AlertModal from "./AlertModal"
import KickConfirmationModal from "./KickConfirmationModal"

function WaitingRoom({
  displayName,
  isSocketConnected,
  connectionMode,
  setConnectionMode,
  gameMode,
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

  const [showKickConfirmationModal, setShowKickConfirmationModal] =
    useState(false)
  const [userIdToKick, setUserIdToKick] = useState("")
  const [displayNameToKick, setDisplayNameToKick] = useState("")

  // TODO: Wrap these all up in an object?
  // Configuration states
  const [showConfiguration, setShowConfiguration] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(
    localStorage.getItem("maxPlayers") || 7
  )
  const [roundLimit, setRoundLimit] = useState(
    localStorage.getItem("roundLimit") || 5
  )
  const [roundTime, setRoundTime] = useState(
    localStorage.getItem("roundTime") || 150
  )
  // gameMode and setGameMode are passed in as props
  const [dynamicTimer, setDynamicTimer] = useState(
    JSON.parse(localStorage.getItem("dynamicTimer")) === false ? false : true
  )
  const [letterElimination, setLetterElimination] = useState(
    JSON.parse(localStorage.getItem("letterElimination")) === false
      ? false
      : true
  )

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

    socket.on("maxPlayersUpdated", (newMaxPlayers) =>
      setMaxPlayers(newMaxPlayers)
    )

    socket.on("roundLimitUpdated", (newRoundLimit) =>
      setRoundLimit(newRoundLimit)
    )

    socket.on("roundTimeUpdated", (newRoundTime) => setRoundTime(newRoundTime))

    socket.on("gameModeUpdated", (newGameMode) => setGameMode(newGameMode))

    socket.on("dynamicTimerUpdated", (newDynamicTimer) =>
      setDynamicTimer(newDynamicTimer)
    )

    socket.on("letterEliminationUpdated", (newLetterElimination) =>
      setLetterElimination(newLetterElimination)
    )

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
      socket.off("maxPlayersUpdated")
      socket.off("roundLimitUpdated")
      socket.off("roundTimeUpdated")
      socket.off("gameModeUpdated")
      socket.off("dynamicTimerUpdated")
      socket.off("letterEliminationUpdated")
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
    let playersReady = 0
    userInfo.forEach((obj) => {
      if (socket.userId && socket.userId !== obj.userId && obj.isReady) {
        playersReady += 1
      }
    })
    if (userInfo.length > 1 && playersReady >= userInfo.length - 1) {
      setAllPlayersReady(true)
    } else {
      setAllPlayersReady(false)
    }
  }, [userInfo])

  // Check if you've been kicked from the room
  useEffect(() => {
    if (userInfo.length > 0) {
      let isInRoom = false
      userInfo.forEach((obj) => {
        if (socket.userId && socket.userId === obj.userId) {
          isInRoom = true
        }
      })
      if (!isInRoom) {
        navigate("/")
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

  function handleKickUserButton(userId, displayName) {
    setUserIdToKick(userId)
    setDisplayNameToKick(displayName)
    setShowKickConfirmationModal(true)
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

  // Configuration setters
  function handleMaxPlayersChange(event) {
    const newMaxPlayers = parseInt(event.target.value)
    setMaxPlayers(newMaxPlayers)
    socket.emit("updateMaxPlayers", roomId, newMaxPlayers)
    if (isHost) {
      localStorage.setItem("maxPlayers", newMaxPlayers)
    }
  }

  function handleRoundLimitChange(event) {
    const newRoundLimit = parseInt(event.target.value)
    setRoundLimit(newRoundLimit)
    socket.emit("updateRoundLimit", roomId, newRoundLimit)
    if (isHost) {
      localStorage.setItem("roundLimit", newRoundLimit)
    }
  }

  function handleRoundTimeChange(event) {
    const newRoundTime = parseInt(event.target.value)
    setRoundTime(newRoundTime)
    socket.emit("updateRoundTime", roomId, newRoundTime)
    if (isHost) {
      localStorage.setItem("roundTime", newRoundTime)
    }
  }

  function handleGameModeChange() {
    const newGameMode = gameMode === "normal" ? "challenge" : "normal"
    setGameMode(newGameMode)
    socket.emit("updateGameMode", roomId, newGameMode)
    // Do we want to update hosts localStorage value if changing gameMode in a private game with friends?
    if (isHost) {
      localStorage.setItem("gameMode", newGameMode)
    }
  }

  function handleDynamicTimerChange() {
    const newDynamicTimer = !dynamicTimer
    setDynamicTimer(newDynamicTimer)
    socket.emit("updateDynamicTimer", roomId, newDynamicTimer)
    if (isHost) {
      localStorage.setItem("dynamicTimer", newDynamicTimer)
    }
  }

  function handleLetterEliminationChange() {
    const newLetterElimination = !letterElimination
    setLetterElimination(newLetterElimination)
    socket.emit("updateLetterElimination", roomId, newLetterElimination)
    if (isHost) {
      localStorage.setItem("letterElimination", newLetterElimination)
    }
  }

  return (
    <div className="waiting-room-background">
      {connectionMode === "private" && (
        <div className="waiting-room-configuration-icon">
          {showConfiguration ? (
            <FaArrowLeft
              onClick={() => setShowConfiguration((prev) => !prev)}
            />
          ) : (
            <FaGear onClick={() => setShowConfiguration((prev) => !prev)} />
          )}
        </div>
      )}

      {!showConfiguration ? (
        <>
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
                <div className="waiting-room-user-line__left">
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
                  <span className="waiting-room-user-line__display-name">
                    {user.displayName}
                  </span>
                </div>
                <div className="waiting-room-user-line__right">
                  {connectionMode === "private" &&
                    isHost &&
                    socket.userId !== user.userId && (
                      <>
                        <div
                          className="waiting-room-user-line__right--kick-x"
                          onClick={() =>
                            handleKickUserButton(user.userId, user.displayName)
                          }
                        >
                          X
                        </div>
                        {showKickConfirmationModal &&
                          user.userId === userIdToKick && (
                            <KickConfirmationModal
                              userId={userIdToKick}
                              roomId={roomId}
                              displayName={displayNameToKick}
                              setShowKickConfirmationModal={
                                setShowKickConfirmationModal
                              }
                            />
                          )}
                      </>
                    )}
                  {connectionMode === "public" && user.currStreak !== 0 && (
                    <span> &nbsp;&nbsp;{user.currStreak}🔥 </span>
                  )}
                </div>
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
        </>
      ) : (
        <div className="waiting-room-configuration">
          <div className="config-option">
            Max Players
            <div className="config-option__right">
              <span>{maxPlayers}</span>
              <input
                type="range"
                min="2"
                max="7"
                value={maxPlayers}
                onChange={handleMaxPlayersChange}
                disabled={!isHost}
              />
            </div>
          </div>
          <div className="config-option">
            Round Limit
            <div className="config-option__right">
              <span>{roundLimit}</span>
              <input
                type="range"
                min="1"
                max="20"
                value={roundLimit}
                onChange={handleRoundLimitChange}
                disabled={!isHost}
              />
            </div>
          </div>
          <div className="config-option">
            Round Time
            <div className="config-option__right">
              <span>{roundTime}</span>
              <input
                type="range"
                min="15"
                max="300"
                step="5"
                value={roundTime}
                onChange={handleRoundTimeChange}
                disabled={!isHost}
              />
            </div>
          </div>
          <div className="config-option">
            Challenge Mode
            <label className="switch">
              <input
                type="checkbox"
                checked={gameMode === "challenge"}
                onChange={handleGameModeChange}
                disabled={!isHost}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="config-option">
            Dynamic Timer
            <label className="switch">
              <input
                type="checkbox"
                checked={dynamicTimer}
                onChange={handleDynamicTimerChange}
                disabled={!isHost}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="config-option">
            Letter Elimination
            <label className="switch">
              <input
                type="checkbox"
                checked={letterElimination}
                onChange={handleLetterEliminationChange}
                disabled={!isHost}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default WaitingRoom
