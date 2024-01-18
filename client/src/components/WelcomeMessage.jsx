import React, { useRef, useLayoutEffect } from "react"
import { HiOutlinePencilSquare } from "react-icons/hi2"

function WelcomeMessage({ username, setUsername, inputWidth, setInputWidth }) {
  const usernameRef = useRef(null)
  /** Seems a bit hacky but works, uses a hidden span element to measure the width and sets the input box size to that width. Dynamically sizing the input box was tricky */
  const textWidthRef = useRef(null)

  useLayoutEffect(() => {
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

  function setCaretInvisible() {
    usernameRef.current.style.caretColor = "transparent"
  }

  function setCaretPosition() {
    // This hsl works pretty well for both light and dark mode.
    usernameRef.current.style.caretColor = "hsl(50, 50%, 40%)"
    const length = usernameRef.current.value.length
    usernameRef.current.setSelectionRange(length, length)
  }

  function focusUsernameForm() {
    if (usernameRef.current) {
      usernameRef.current.focus()
    }
  }

  return (
    <div className="welcome-message">
      Hey there,
      <div className="username-line">
        <input
          ref={usernameRef}
          className="username-form"
          type="text"
          value={username}
          onChange={handleUserNameChange}
          onBlur={handleUserNameChange}
          onClick={setCaretPosition}
          onMouseDown={setCaretInvisible}
          spellCheck="false"
          style={{ width: `${inputWidth}px` }}
        />
        !
        <span ref={textWidthRef} className="hidden-span">
          {username}
        </span>
      </div>
      <span
        style={{
          display: "inline-flex",
        }}
        title="Change display name"
      >
        <HiOutlinePencilSquare
          className="username-form__pencil"
          onClick={focusUsernameForm}
        />
      </span>
    </div>
  )
}

export default WelcomeMessage
