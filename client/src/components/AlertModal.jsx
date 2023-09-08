import React, { useEffect } from "react"

function AlertModal({
  message,
  showAlertModal,
  setShowAlertModal,
  isOutOfGuesses,
  isConfettiRunning,
}) {
  useEffect(() => {
    if (showAlertModal) {
      // Most of these alerts are temporary (1s). The exceptions are:
      // - out of guesses (infinite time)
      // - win (8000ms, which just happens to be when the confetti disappears)
      if (isOutOfGuesses) {
        return
      }

      const ms = isConfettiRunning ? 8000 : 1000

      const timer = setTimeout(() => {
        setShowAlertModal(false)
      }, ms)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [showAlertModal])

  return (
    <>
      {showAlertModal && (
        <div
          className={`alert${showAlertModal ? "" : "--hidden"}`}
          onTransitionEnd={() => setShowAlertModal(false)}>
          {message}
        </div>
      )}
    </>
  )
}

export default AlertModal
