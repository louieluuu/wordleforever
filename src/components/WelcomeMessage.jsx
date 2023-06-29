import React, { useRef } from "react"

function WelcomeMessage({ nickname, handleNicknameChange }) {
  const textBoxRef = useRef(null)

  function setCaretInvisible() {
    textBoxRef.current.style.caretColor = "transparent"
  }

  function setCaretPosition() {
    textBoxRef.current.style.caretColor = "black"
    const length = textBoxRef.current.value.length
    textBoxRef.current.setSelectionRange(length, length)
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: "Lobster",
        fontSize: "3rem",
      }}>
      <label>
        Welcome,&nbsp;
        <input
          className="nickname-form"
          ref={textBoxRef}
          spellCheck="false"
          onMouseDown={setCaretInvisible}
          onClick={setCaretPosition}
          onChange={handleNicknameChange}
          value={nickname}
          style={{
            border: "none",
            outline: "none",
            font: "inherit",
            cursor: "pointer",
          }}
        />
      </label>
    </div>
  )
}

export default WelcomeMessage
