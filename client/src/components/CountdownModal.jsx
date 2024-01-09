import React, { useEffect, useState } from 'react'

function CountdownModal({ isCountdownRunning, setIsCountdownRunning }) {
  const [seconds, setSeconds] = useState(3)

  useEffect(() => {
    function resetCountdown() {
      setIsCountdownRunning(false)
      setSeconds(3)
    }

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
    <div>
      <dialog className='countdown-timer' open={isCountdownRunning}>
        <p>The game will start in... {seconds}</p>
      </dialog>
    </div>
  )
}

export default CountdownModal
