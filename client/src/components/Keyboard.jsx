import React, { useEffect } from "react"

import { IoBackspaceOutline } from "react-icons/io5"

export default function Keyboard({
  hints,
  isOutOfGuesses,
  isGameOver,
  isInGame,
  isCountdownRunning,
  handleLetter,
  handleEnter,
  handleBackspace,
}) {
  // Event listener for typing
  // TODO: Needed to remove the 2nd param "[]" for this to work?
  useEffect(() => {
    // I'd like to be able to say:
    //    window.addEventListener("keydown", (e) => handleKeyBoardInput(e.key))
    // but that isn't possible. We have to get this intermediary function
    // to pass the e.key to the "real" handler below.
    function handleKeyDown(e) {
      handleKeyboardInput(e.key)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

  // The real handler. Handles input from both typing and clicking of Keyboard component.
  function handleKeyboardInput(key) {
    const isLetterRegex = /^[a-zA-Z]$/

    // Below logic might be a little confusing, but it's all done so
    // a user can start a new game by pressing Enter instead of using the mouse,
    // while also disabling their Enter key if it's not for that specific purpose.
    if (!isInGame || isCountdownRunning) {
      return
    }

    // Allow someone who's run out of guesses to restart the game by pressing Enter.
    if (isOutOfGuesses && !isGameOver) {
      return
    }

    if (isGameOver && key !== "Enter") {
      return
    }

    if (isLetterRegex.test(key)) {
      handleLetter(key)
    }
    //
    else if (key === "Enter") {
      handleEnter()
    }
    //
    else if (key === "Backspace") {
      handleBackspace()
    }
  }

  function getKeyboardKeyClassName(letter) {
    let keyboardKeyClassName = "keyboard__key"

    // The order of "hints" checks prioritizes green. A letter might start
    // out as a yellow hint, but become a green hint later. In that case,
    // the key should ultimately be displayed as green.
    if (hints.green.has(letter)) {
      keyboardKeyClassName += "--correct"
    }
    //
    else if (hints.yellow.has(letter)) {
      keyboardKeyClassName += "--wrong-position"
    }
    //
    else if (hints.gray.has(letter)) {
      keyboardKeyClassName += "--wrong"
    }

    return keyboardKeyClassName
  }

  const firstRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
  const secondRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
  const thirdRow = ["Z", "X", "C", "V", "B", "N", "M"]

  return (
    <div className="keyboard">
      <div className="keyboard__row">
        {firstRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => handleKeyboardInput(letter)}>
            {letter}
          </button>
        ))}
      </div>

      <div className="keyboard__row">
        {secondRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => handleKeyboardInput(letter)}>
            {letter}
          </button>
        ))}
      </div>

      <div className="keyboard__row">
        <div
          className="keyboard__key--large"
          key="Enter"
          onClick={() => handleKeyboardInput("Enter")}>
          ENTER
        </div>
        {thirdRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => handleKeyboardInput(letter)}>
            {letter}
          </button>
        ))}
        <div
          className="keyboard__key--large--svg"
          key="Backspace"
          onClick={() => handleKeyboardInput("Backspace")}>
          <IoBackspaceOutline />
        </div>
      </div>
    </div>
  )
}
