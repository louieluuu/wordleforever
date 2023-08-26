import React, { useEffect, useState } from "react"

function CountdownTimer({ isCountdownRunning, setIsCountdownRunning, isChallengeOn, handleEnter }) {
  const [seconds, setSeconds] = useState(3)

  useEffect(() => {
    function resetCountdown() {
      setIsCountdownRunning(false)
      setSeconds(3)
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    // Stop the countdown when it reaches 0
    if (seconds < 0) {
      clearInterval(timer)
      resetCountdown()

      if (isChallengeOn) {
        handleEnter()
      }
    }

    // Clean up the timer when the component unmounts or the dialog is closed
    return () => {
      clearInterval(timer)
    }
  }, [seconds])

  return (
    <div>
      <dialog className="countdown-timer" open={isCountdownRunning}>
        <p>The game will start in... {seconds}</p>
      </dialog>
    </div>
  )
}

export default CountdownTimer
