import React, { useRef } from "react"
import { useEffect } from "react"

import { HiOutlinePencilSquare } from "react-icons/hi2"

function WelcomeMessage({ nickname, handleNicknameChange, roomId }) {
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
    <div className={`welcome-message${roomId === "" ? "" : "--hidden"}`}>
      Hey there,
      <input
        className={`nickname-form${roomId === "" ? "" : "--hidden"}`}
        ref={textBoxRef}
        spellCheck="false"
        onMouseDown={setCaretInvisible}
        onClick={setCaretPosition}
        onChange={handleNicknameChange}
        value={nickname}
      />
      <HiOutlinePencilSquare
        className={`nickname-form__pencil${roomId === "" ? "" : "--hidden"}`}
        onClick={focusNicknameForm}
        style={{ cursor: "pointer" }}
      />
    </div>
  )
}

export default WelcomeMessage
