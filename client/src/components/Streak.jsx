import React from "react"

import Flame from "../assets/flame.svg?react"

function Streak({ streak, inGame, connectionMode, gameMode, renderNumber }) {
  function getFlameClassName() {
    let flameClassName = "flame"

    if (streak === undefined) {
      return flameClassName + "--hidden"
    }

    // Edge case for streak === 0.
    // While inGame and public mode, I want a low opacity flame.
    // In all other cases, I want no flame.
    if (streak === 0) {
      if (inGame && connectionMode === "public") {
        flameClassName += "--0"
      }
      //
      else {
        flameClassName += "--hidden"
      }
      return flameClassName
    }

    if (connectionMode === "private" && inGame) {
      flameClassName += "--hidden"
      return flameClassName
    }

    // Non-edge cases:
    // First: are we using red or blue?
    if (gameMode === "challenge") {
      flameClassName += "--challenge"
    }
    //
    else {
      flameClassName += "--normal"
    }

    // Second: what is the intensity of the hue?
    if (1 <= streak && streak <= 3) {
      flameClassName += "--1"
    }
    //
    else if (4 <= streak && streak <= 6) {
      flameClassName += "--4"
    }
    //
    else if (7 <= streak && streak <= 9) {
      flameClassName += "--7"
    }
    //
    else {
      flameClassName += "--10"
    }

    return flameClassName
  }

  return (
    <>
      {connectionMode.includes("offline") ? null : (
        <div className="streak-container">
          <Flame className={getFlameClassName()} />
          <span className="streak-text">
            {streak === 0 || renderNumber === false
              ? ""
              : connectionMode === "private"
              ? inGame
                ? ""
                : streak
              : `${streak}`}
          </span>
        </div>
      )}
    </>
  )
}

export default Streak
