import React, { useRef } from "react"
import { useEffect } from "react"

const bodyStyle = {
  display: "flex",
  gap: "none",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: "Lobster",
  fontSize: "3.5rem",
  paddingBottom: 0,
  lineHeight: "0.8",
}

function WelcomeMessage({ nickname, handleNicknameChange }) {
  const textBoxRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        textBoxRef.current.blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  function setCaretInvisible() {
    textBoxRef.current.style.caretColor = "transparent"
  }

  function setCaretPosition() {
    textBoxRef.current.style.caretColor = "black"
    const length = textBoxRef.current.value.length
    textBoxRef.current.setSelectionRange(length, length)
  }

  return (
    <div>
      <label style={bodyStyle}>
        Welcome back!
        <input
          className="nickname-form"
          ref={textBoxRef}
          spellCheck="false"
          onMouseDown={setCaretInvisible}
          onClick={setCaretPosition}
          onChange={handleNicknameChange}
          value={nickname}
          style={{
            textAlign: "center",
            border: "none",
            outline: "none",
            font: "inherit",
            fontFamily: "Lobster",
            cursor: "pointer",
          }}
        />
      </label>
    </div>
  )
}

export default WelcomeMessage
