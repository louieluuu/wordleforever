import React, { useEffect, useState } from "react"

// Audio
import { Howl } from "howler"

import countdownCountingWebm from "../assets/audio/webm/countdown-counting.webm"
import countdownFinishWebm from "../assets/audio/webm/countdown-finish.webm"

import countdownCountingMp3 from "../assets/audio/mp3/countdown-counting.mp3"
import countdownFinishMp3 from "../assets/audio/mp3/countdown-finish.mp3"

const audioCountdownCounting = new Howl({
  src: [countdownCountingWebm, countdownCountingMp3],
})
const audioCountdownFinish = new Howl({
  src: [countdownFinishWebm, countdownFinishMp3],
})

function CountdownModal({
  isCountdownRunning,
  setIsCountdownRunning,
  connectionMode,
  roundCounter,
  playAudio,
}) {
  const [seconds, setSeconds] = useState(3)

  useEffect(() => {
    function resetCountdown() {
      setIsCountdownRunning(false)
      setSeconds(3)
    }

    seconds === 0
      ? playAudio(audioCountdownFinish)
      : playAudio(audioCountdownCounting)

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    if (seconds <= 0) {
      clearInterval(timer)
      resetCountdown()
    }

    return () => {
      clearInterval(timer)
    }
  }, [seconds])

  return (
    <dialog className="countdown-timer" open={isCountdownRunning}>
      {connectionMode === "online-private" ? (
        <p>
          Round {roundCounter} will start in... {seconds}
        </p>
      ) : (
        <p>The game will start in... {seconds}</p>
      )}
    </dialog>
  )
}

export default CountdownModal
