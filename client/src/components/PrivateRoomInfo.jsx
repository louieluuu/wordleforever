import React, { useState, useEffect } from "react"

import { LuClock12 } from "react-icons/lu"

function PrivateRoomInfo({
  connectionMode,
  roundCounter,
  timerIndex,
  roundTimer,
  maxRounds,
  isGameOver,
}) {
  const [prevTimer, setPrevTimer] = useState(0)
  const [timerDiff, setTimerDiff] = useState(0)

  useEffect(() => {
    setTimerDiff(prevTimer - roundTimer)
    setPrevTimer(roundTimer)
  }, [roundTimer])

  function getTimerClassName() {
    let timerClassName = "timer"
    if (roundTimer <= 15 && !isGameOver) {
      timerClassName += "--low"
    } else if (timerDiff > 30) {
      timerClassName += "--big-drop"
    } else if (timerDiff > 20) {
      timerClassName += "--medium-drop"
    } else if (timerDiff > 10) {
      timerClassName += "--small-drop"
    }
    return timerClassName
  }

  return (
    <>
      {connectionMode === "online-private" && roundCounter !== 0 && (
        <div className="private-room-info">
          <span className="round-counter">
            Round: {roundCounter}/{maxRounds}
          </span>
          <span className={getTimerClassName()}>
            {roundTimer}
            <span className="clock" style={{ verticalAlign: "middle" }}>
              &nbsp;
              <LuClock12
                style={{
                  transform: `rotate(${360 - timerIndex * 90}deg)`,
                }}
              />
            </span>
          </span>
        </div>
      )}
    </>
  )
}

export default PrivateRoomInfo
