import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { IoBackspaceOutline } from "react-icons/io5"
import { IoReturnDownBackSharp } from "react-icons/io5"
import { MdKeyboardDoubleArrowUp } from "react-icons/md"

// Helpers
import { handleStartPublicGame } from "../helpers/socketHelpers"

// Audio
import { Howl } from "howler"

import keyPressWebm from "../assets/audio/webm/key-press.webm"
import keyPressMp3 from "../assets/audio/mp3/key-press.mp3"

const audioKeyPress = new Howl({
  src: [keyPressWebm, keyPressMp3],
  volume: 0.1,
})

function Keyboard({
  handleLetter,
  handleBackspace,
  handleEnter,
  hints,
  isCountdownRunning,
  isGameOver,
  isMatchOver,
  hasSolved,
  isOutOfGuesses,
  gameMode,
  connectionMode,
  isHost,
  startNewGame,
  isKeyboardLocked,
  showPostGameDialog,
  setShowPostGameDialog,
  playAudio,
}) {
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyPress(e) {
      /* Weird bug / unintended functionality when clicking the letters on the keyboard, which then selects the element, so when pressing 'Enter' it also clicks that previously selected element leading to duplicate letters*/
      if (e.key === "Enter" && document.activeElement.tagName === "BUTTON") {
        handleKeyPress(e.key)
        e.preventDefault()
      } else {
        handleKeyPress(e.key)
      }
    }

    window.addEventListener("keydown", onKeyPress)

    return () => {
      window.removeEventListener("keydown", onKeyPress)
    }
  }, [handleKeyPress])

  function handleTouchStart(letter) {
    playAudio(audioKeyPress)
    handleKeyPress(letter)
  }

  // Explanation: https://stackoverflow.com/questions/45612379/react-onclick-and-ontouchstart-fired-simultaneously
  // e.preventDefault() prevents the onClick event from firing after onTouchStart.
  function handleTouchEnd(e) {
    e.preventDefault()
  }

  async function handleKeyPress(key) {
    // Logic to lock keyboard input depending on certain states
    if (isKeyboardLocked) {
      return
    }
    if (isCountdownRunning) {
      return
    }
    if (hasSolved && !isGameOver) {
      return
    }
    if (isOutOfGuesses && !isGameOver) {
      return
    }
    if (isGameOver && key !== "Enter") {
      return
    }
    if (connectionMode === "private") {
      if (isMatchOver && key === "Enter") {
        await handlePlayAgain()
        return
      }
    } else {
      if (isGameOver && key === "Enter") {
        await handlePlayAgain()
        return
      }
    }

    const regexIsLetter = /^[a-zA-Z]$/

    if (regexIsLetter.test(key)) {
      handleLetter(key)
    } else if (key === "Backspace") {
      handleBackspace()
    } else if (key === "Enter") {
      handleEnter()
    }
  }

  async function handlePlayAgain() {
    try {
      if (!connectionMode) {
        return
      }

      switch (connectionMode) {
        case "private":
          startNewGame()
          break
        case "public":
          const publicRoomId = await handleStartPublicGame(gameMode)
          navigate(`/room/${publicRoomId}`)
          break
        case "offline":
          startNewGame()
          break
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  function getCellClassName(letter) {
    let tileClassName = "keyboard__cell"

    if (hints.green.has(letter)) {
      tileClassName += "--green"
    } else if (hints.yellow.has(letter)) {
      tileClassName += "--yellow"
    } else if (hints.grey.has(letter)) {
      tileClassName += "--grey"
    } else if (hints.eliminated.has(letter)) {
      tileClassName += "--eliminated"
    }

    return tileClassName
  }

  const topRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
  const midRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
  const botRow = ["Z", "X", "C", "V", "B", "N", "M"]

  return (
    <div className="keyboard">
      <div className="keyboard__row">
        {topRow.map((letter, index) => (
          <button
            key={index}
            className={getCellClassName(letter)}
            onTouchStart={() => handleTouchStart(letter)}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboard__row">
        {midRow.map((letter, index) => (
          <button
            key={index}
            className={getCellClassName(letter)}
            onTouchStart={() => handleTouchStart(letter)}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboard__row">
        <div
          className="keyboard__cell--large"
          onTouchStart={() => handleKeyPress("Enter")}
          onTouchEnd={handleTouchEnd}
          onClick={() => handleKeyPress("Enter")}
        >
          ENTER
        </div>
        {botRow.map((letter, index) => (
          <button
            key={index}
            className={getCellClassName(letter)}
            onTouchStart={() => handleTouchStart(letter)}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
        <div
          className="keyboard__cell--large--icon"
          key="Backspace"
          onTouchStart={() => handleTouchStart("Backspace")}
          onTouchEnd={handleTouchEnd}
          onClick={() => handleKeyPress("Backspace")}
        >
          <IoBackspaceOutline />
        </div>
      </div>
      {isGameOver && (
        <div className="keyboard__postgame">
          {connectionMode === "private" &&
            isMatchOver &&
            !showPostGameDialog && (
              <div
                className="keyboard__postgame--popup"
                onClick={() => setShowPostGameDialog(true)}
              >
                <MdKeyboardDoubleArrowUp />
              </div>
            )}
          {(connectionMode !== "private" || (isMatchOver && isHost)) && (
            <button className="menu__btn--new-game" onClick={handlePlayAgain}>
              NEW GAME
              <IoReturnDownBackSharp />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Keyboard
