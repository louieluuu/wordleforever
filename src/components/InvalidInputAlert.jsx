import React, { useEffect } from "react"

function InvalidInputAlert({ message, isVisible, setIsVisible }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isVisible, setIsVisible])

  return (
    <>
      {isVisible && (
        <div
          className={`alert${isVisible ? "" : "--hidden"}`}
          onTransitionEnd={() => setIsVisible(false)}>
          {message}
        </div>
      )}
    </>
  )
}

export default InvalidInputAlert
