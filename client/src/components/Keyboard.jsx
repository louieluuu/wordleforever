import React, { useEffect } from "react"

import { IoBackspaceOutline } from "react-icons/io5"

export default function Keyboard({
  hints,
  isOutOfGuesses,
  isGameOver,
  isCountdownRunning,
  isChallengeOn,
  gameMode,
  solution,
  handleLetter,
  handleEnter,
  handleBackspace,
}) {
  /*
   * USE EFFECTS
   */

  const handleKeyDown = (e) => {
    handleKeyboardInput(e.key)
  }

  // Event listener for typing
  // TODO: Works with no deps at all.
  // TODO: Doesn't work with empty dep array [].
  // TODO: Works with [handleKeyDown] (function must be declared outside, and before the useEffect itself).
  useEffect(() => {
    // I'd like to be able to say:
    //    window.addEventListener("keydown", (e) => handleKeyBoardInput(e.key))
    // but that isn't possible. We have to get this intermediary function
    // to pass the e.key to the "real" handler below.

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Challenge Mode - automatically Enter the first randomized guess.

  // The solution dep is pretty interesting; without it, handleEnter()
  // runs before the solution has been set in the Game component.
  // By adding solution as a dep, we say to run this useEffect again
  // once the solution gets set.

  // PS. Using userGuess as a dep might be more intuitive, but userGuess
  // changes every guess, and we don't want the useEffect to run that often -
  // only once at the beginning to enter the Challenge guess automatically.
  // Hence, the use of solution as the dep.
  useEffect(() => {
    if (isChallengeOn) {
      if (gameMode.includes("online")) {
        if (!isCountdownRunning) {
          handleEnter()
        }
      }
      //
      else if (gameMode.includes("offline")) {
        handleEnter()
      }
    }
  }, [isCountdownRunning, solution]) // TODO: check deps

  /*
   * HELPER FUNCTIONS
   */
  // The real handler. Handles input from both typing and clicking of Keyboard component.
  function handleKeyboardInput(key) {
    const isLetterRegex = /^[a-zA-Z]$/

    // Below logic might be a little confusing, but it's all done so
    // a user can start a new game by pressing Enter instead of using the mouse,
    // while also disabling their Enter key if it's not for that specific purpose.
    if (isCountdownRunning) {
      return
    }

    // Allow someone who's run out of guesses to restart the game by pressing Enter.
    // TODO: Check this logic; in public rooms, this should be true, but in private rooms,
    // TODO: you shouldn't be able to start a new game yet.
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

  // Colors the Keyboard tiles using the "hints" Set.
  function getKeyboardKeyClassName(letter) {
    let keyboardKeyClassName = "keyboard__key"

    // The order of the following "hints" checks prioritizes green.
    // A letter might start out as a yellow hint, but become a green hint later.
    // The key should ultimately be displayed as green; the order reflects that.
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
