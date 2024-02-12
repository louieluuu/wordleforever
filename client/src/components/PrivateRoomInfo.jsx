import React, { useState, useEffect } from "react"

import { LuClock12 } from "react-icons/lu"

// Audio
import { Howl } from "howler"

import timerJiggleWebm from "../assets/audio/webm/timer-jiggle.webm"
import timerJiggleMp3 from "../assets/audio/mp3/timer-jiggle.mp3"

const audioTimerJiggle = new Howl({
  src: [timerJiggleWebm, timerJiggleMp3],
  volume: 0.75,
})

function PrivateRoomInfo({
  connectionMode,
  roundCounter,
  timerIndex,
  roundTimer,
  maxRounds,
  isGameOver,
  hasSolved,
  playAudio,
}) {
  const [prevTimer, setPrevTimer] = useState(0)
  const [timerDiff, setTimerDiff] = useState(0)

  useEffect(() => {
    const newTimerDiff = prevTimer - roundTimer
    if (!hasSolved && newTimerDiff > 10) {
      playAudio(audioTimerJiggle)
    }

    setTimerDiff(newTimerDiff)
    setPrevTimer(roundTimer)
  }, [roundTimer, hasSolved])

  function getTimerClassName() {
    let timerClassName = "timer"
    if (roundTimer <= 15 && !isGameOver) {
      timerClassName += "--low"
    } else if (!hasSolved) {
      if (timerDiff > 30) {
        timerClassName += "--big-drop"
      } else if (timerDiff > 20) {
        timerClassName += "--medium-drop"
      } else if (timerDiff > 10) {
        timerClassName += "--small-drop"
      }
    }

    return timerClassName
  }

  return (
    <>
      {connectionMode === "private" && roundCounter !== 0 && (
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
