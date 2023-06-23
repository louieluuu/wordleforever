import React, { useEffect, useState } from "react"

function CountdownTimer({ isInGame }) {
  const [isOpen, setIsOpen] = useState(true)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Start the countdown when the dialog is open
    if (isInGame) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)

      // Stop the countdown when it reaches 0
      if (countdown === -1) {
        clearInterval(timer)
        closeDialog()
      }

      // Clean up the timer when the component unmounts or the dialog is closed
      return () => {
        clearInterval(timer)
      }
    }
  }, [isOpen, countdown])

  const openDialog = () => {
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
  }

  return (
    <div>
      <dialog open={isOpen} onClose={closeDialog}>
        <p>The game will start in... {countdown}</p>
      </dialog>
    </div>
  )
}

export default CountdownTimer
