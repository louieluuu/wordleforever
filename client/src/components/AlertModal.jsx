import React, { useEffect } from "react"

function AlertModal({
  showAlertModal,
  setShowAlertModal,
  message,
  isGameOver,
  hasSolved,
  isConfettiRunning,
  inGame,
}) {
  let alertTimeout

  useEffect(() => {
    if (showAlertModal) {
      // Most of these alerts are temporary (1.5s). The exceptions are:
      // - didn't solve (infinite time)
      // - win (8000ms, which just happens to be when the confetti disappears)
      if (inGame && isGameOver && !hasSolved) {
        return
      }

      const ms = isConfettiRunning ? 8000 : 1500
      alertTimeout = setTimeout(() => {
        setShowAlertModal(false)
      }, ms)
    }

    return () => {
      clearTimeout(alertTimeout)
    }
  }, [showAlertModal])

  function getAlertModalClassName() {
    let alertModalClassName = "alert-modal"
    if (inGame) {
      if (isGameOver || hasSolved) {
        alertModalClassName += "__post-game"
      } else {
        alertModalClassName += "__in-game"
      }
    } else {
      alertModalClassName += "__lobby"
    }
    if (!showAlertModal) {
      alertModalClassName += " hide"
    }
    return alertModalClassName
  }

  return (
    <>
      <div
        className={getAlertModalClassName()}
        onTransitionEnd={() => setShowAlertModal(false)}
      >
        {message}
      </div>
    </>
  )
}

export default AlertModal
