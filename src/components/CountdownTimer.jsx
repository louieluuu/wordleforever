import React, { useEffect, useState } from "react"

function CountdownTimer({ isCountdownOver, setIsCountdownOver, userGuess, handleEnter }) {
  const [seconds, setSeconds] = useState(3)

  useEffect(() => {
    function resetCountdown() {
      setIsCountdownOver(true)
      setSeconds(3)
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    // Stop the countdown when it reaches 0
    if (seconds === -1) {
      clearInterval(timer)
      resetCountdown()

      // TODO: Change this to isChallengeOn, not sure why this cond.....
      if (userGuess[0] !== "") {
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
      <dialog className="countdown-timer" open={!isCountdownOver}>
        <p>The game will start in... {seconds}</p>
      </dialog>
    </div>
  )
}

export default CountdownTimer
