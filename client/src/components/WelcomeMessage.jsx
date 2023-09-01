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
    textBoxRef.current.style.caretColor = "black"
    const length = textBoxRef.current.value.length
    textBoxRef.current.setSelectionRange(length, length)
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
          style={{
            backgroundColor: "transparent",
            textAlign: "center",
            border: "none",
            outline: "none",
            font: "inherit",
            fontFamily: "Lobster",
            fontSize: "3.5rem",
            cursor: "pointer",
            textDecoration: "dotted underline",
            textUnderlineOffset: "0.5rem",
          }}
        />
      </label>
    </div>
  )
}

export default WelcomeMessage
