import React, { useRef, useLayoutEffect } from "react"
import { HiOutlinePencilSquare } from "react-icons/hi2"

function WelcomeMessage({
  displayName,
  setDisplayName,
  inputWidth,
  setInputWidth,
}) {
  const displayNameRef = useRef(null)
  /** Seems a bit hacky but works, uses a hidden span element to measure the width and sets the input box size to that width. Dynamically sizing the input box was tricky */
  // const textWidthRef = useRef(null)

  // useLayoutEffect(() => {
  //   if (textWidthRef.current) {
  //     const textWidth = textWidthRef.current.clientWidth
  //     setInputWidth(textWidth + 10)
  //   }
  // }, [displayName, textWidthRef])

  function handleDisplayNameChange(e) {
    const updatedDisplayName = e.target.value

    // Check if the input is empty or contains only spaces
    if (e.type === "blur" && updatedDisplayName === "") {
      setDisplayName("Wordler")
    } else {
      // Enforce a length limit
      if (updatedDisplayName.length > 20) {
        return
      }
      setDisplayName(updatedDisplayName)
      localStorage.setItem("displayName", updatedDisplayName)
    }
  }

  function setCaretInvisible() {
    displayNameRef.current.style.caretColor = "transparent"
  }

  function setCaretPosition() {
    // This hsl works pretty well for both light and dark mode.
    displayNameRef.current.style.caretColor = "hsl(50, 50%, 40%)"
    const length = displayNameRef.current.value.length
    displayNameRef.current.setSelectionRange(length, length)
  }

  function focusDisplayNameForm() {
    if (displayNameRef.current) {
      displayNameRef.current.focus()
    }
  }

  return (
    <div className="welcome-message">
      Hey there,
      <div className="username-line">
        <input
          ref={displayNameRef}
          className="username-form"
          type="text"
          value={displayName}
          onChange={handleDisplayNameChange}
          onBlur={handleDisplayNameChange}
          onClick={setCaretPosition}
          onMouseDown={setCaretInvisible}
          spellCheck="false"
          // style={{ width: `${inputWidth}px` }}
        />
        {/* !
        <span ref={textWidthRef} className="hidden-span">
          {displayName}
        </span> */}
      </div>
      <span
        style={{
          display: "inline-flex",
        }}
        title="Change display name"
      >
        <HiOutlinePencilSquare
          className="username-form__pencil"
          onClick={focusDisplayNameForm}
        />
      </span>
    </div>
  )
}

export default WelcomeMessage
