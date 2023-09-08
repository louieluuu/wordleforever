import React, { useRef } from "react"
import { useEffect } from "react"

import { HiOutlinePencilSquare } from "react-icons/hi2"

const bodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: "Calistoga",
  fontSize: "3.5rem",
  lineHeight: "0.80",
  marginBlock: "2.5rem",
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
    // This hsl works pretty well for both light and dark mode.
    textBoxRef.current.style.caretColor = "hsl(50, 50%, 40%)"
    const length = textBoxRef.current.value.length
    textBoxRef.current.setSelectionRange(length, length)
  }

  function focusNicknameForm() {
    if (textBoxRef.current) {
      textBoxRef.current.focus()
    }
  }

  return (
    <div>
      <label style={bodyStyle}>
        Hey there,
        <input
          className="nickname-form"
          ref={textBoxRef}
          spellCheck="false"
          onMouseDown={setCaretInvisible}
          onClick={setCaretPosition}
          onChange={handleNicknameChange}
          value={nickname}
        />
        <HiOutlinePencilSquare
          className="nickname-form__pencil"
          onClick={focusNicknameForm}
          style={{ cursor: "pointer" }}
        />
      </label>
    </div>
  )
}

export default WelcomeMessage
