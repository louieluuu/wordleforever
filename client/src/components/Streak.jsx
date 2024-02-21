import React from "react"

import { ReactComponent as Flame } from "../assets/streakFlame.svg"

function Streak({ streak, isChallengeOn, gameMode, isInGame }) {
  /*
   * HELPER FUNCTIONS
   */

  function getStreakClassName() {
    let streakClassName = "streak"

    // Edge case for streak === 0.
    // While inGame and public mode, I want a low opacity flame.
    // In all other cases, I want no flame.
    if (streak === 0) {
      if (isInGame && gameMode === "online-public") {
        streakClassName += "--0"
      }
      //
      else {
        streakClassName += "--hidden"
      }
      return streakClassName
    }

    if (gameMode === "online-private" && isInGame) {
      streakClassName += "--hidden"
      return streakClassName
    }

    // Non-edge cases:
    // First: are we using red or blue?
    if (isChallengeOn) {
      streakClassName += "--challenge"
    }
    //
    else {
      streakClassName += "--normal"
    }

    // Second: what is the intensity of the hue?
    if (1 <= streak && streak <= 3) {
      streakClassName += "--1-3"
    }
    //
    else if (4 <= streak && streak <= 6) {
      streakClassName += "--4-6"
    }
    //
    else if (7 <= streak && streak <= 9) {
      streakClassName += "--7-9"
    }
    //
    else {
      streakClassName += "--10"
    }

    return streakClassName
  }

  return (
    <>
      {gameMode.includes("offline") ? null : (
        <div
          style={{ display: "flex", alignItems: "center", fontSize: "3rem" }}
        >
          {streak === 0
            ? ""
            : gameMode === "online-private"
            ? isInGame
              ? ""
              : streak
            : streak}
          <Flame
            className={getStreakClassName()}
            style={{ width: "3rem", height: "3rem" }}
          />
        </div>
      )}
    </>
  )
}

export default Streak
