import React, { useRef, useEffect } from "react"

function WelcomeMessage({ username, setUsername, inputWidth, setInputWidth }) {
  const usernameRef = useRef(null)
  /** Seems a bit hacky but works, uses a hidden span element to measure the width and sets the input box size to that width. Dynamically sizing the input box was tricky */
  const textWidthRef = useRef(null)

  useEffect(() => {
    if (textWidthRef.current) {
      const textWidth = textWidthRef.current.clientWidth
      setInputWidth(textWidth + 10)
    }
  }, [username, textWidthRef])

  function handleUserNameChange(e) {
    const updatedUsername = e.target.value

    // Check if the input is empty or contains only spaces
    if (e.type === "blur" && updatedUsername === "") {
      setUsername("Wordler")
    } else {
      // Enforce a length limit
      if (updatedUsername.length > 20) {
        return
      }
      setUsername(updatedUsername)
      localStorage.setItem("username", updatedUsername)
    }
  }

  function handleUserNameClick() {
    if (usernameRef.current) {
      setTimeout(() => {
        usernameRef.current.select()
      }, 0)
    }
  }

  return (
    <div className="welcome-message">
      <h1>Welcome, </h1>
      <input
        ref={usernameRef}
        className="username"
        type="text"
        value={username}
        onChange={handleUserNameChange}
        onBlur={handleUserNameChange}
        onClick={handleUserNameClick}
        style={{ width: `${inputWidth}px` }}
      />
      <span ref={textWidthRef} className="hidden-span">
        {username}
      </span>
      <h1>!</h1>
    </div>
  )
}

export default WelcomeMessage
