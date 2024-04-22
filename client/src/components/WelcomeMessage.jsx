import React, { useRef, useLayoutEffect, useState } from "react"
import containsBadWord from "../helpers/nameFilter"

import { HiOutlinePencilSquare } from "react-icons/hi2"
import { Tooltip } from "react-tooltip"

import AlertModal from "./AlertModal"

function WelcomeMessage({
  isFirstTimeVisitor,
  displayName,
  setDisplayName,
  inputWidth,
  setInputWidth,
}) {
  const displayNameRef = useRef(null)
  /** Seems a bit hacky but works, uses a hidden span element to measure the width and sets the input box size to that width. Dynamically sizing the input box was tricky */
  const textWidthRef = useRef(null)

  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

  useLayoutEffect(() => {
    if (textWidthRef.current) {
      const textWidth = textWidthRef.current.clientWidth
      setInputWidth(textWidth + 45)
    }
  }, [displayName, textWidthRef])

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
      // Disallow some truly depraved words
      if (containsBadWord(updatedDisplayName)) {
        setAlertMessage("Display name cannot contain inappropriate words")
        setShowAlertModal(true)
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

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.target.blur()
    }
  }

  return (
    <div className="welcome-message">
      Hey there,
      <div className="display-name-line">
        <input
          ref={displayNameRef}
          className={`display-name-form${
            isFirstTimeVisitor ? "--first-time" : ""
          }`}
          type="text"
          value={displayName}
          onChange={handleDisplayNameChange}
          onBlur={handleDisplayNameChange}
          onClick={setCaretPosition}
          onMouseDown={setCaretInvisible}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          style={{ width: `${inputWidth}px` }}
        />
        <span ref={textWidthRef} className="hidden-span">
          {displayName}
        </span>
      </div>
      <a data-tooltip-id="display-name-tooltip">
        <HiOutlinePencilSquare
          className={`display-name-form__pencil${
            isFirstTimeVisitor ? "--first-time" : ""
          }`}
          onClick={focusDisplayNameForm}
          title="Change display name"
        />
      </a>
      <Tooltip
        className="display-name-tooltip"
        id="display-name-tooltip"
        place="bottom"
        isOpen={isFirstTimeVisitor}
      >
        <div className="display-name-tooltip__text">
          Welcome to Wordle Forever!
          <br />
          Edit your name here at any time.
          <br />
        </div>
      </Tooltip>
      <AlertModal
        showAlertModal={showAlertModal}
        setShowAlertModal={setShowAlertModal}
        message={alertMessage}
      />
    </div>
  )
}

export default WelcomeMessage
