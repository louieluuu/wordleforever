import React, { useEffect } from "react"

function AlertModal({ message, showAlertModal, setShowAlertModal, isOutOfGuesses }) {
  useEffect(() => {
    if (showAlertModal) {
      // Most of these alerts are temporary (1s). The exception is if
      // the user is out of guesses; user would want to see the solution
      // for an extended period of time.
      if (isOutOfGuesses) {
        return
      }

      const timer = setTimeout(() => {
        setShowAlertModal(false)
      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [showAlertModal, setShowAlertModal])

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
