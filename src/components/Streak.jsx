import React from "react"

import streakFlame from "../assets/streakFlame.svg"

function Streak({ streak, isChallengeMode }) {
  return (
    <>
      {isChallengeMode ? (
        <div style={{ fontSize: "16px" }}>
          {streak}
          <img src={streakFlame} style={{ width: "3%", textColor: "blue" }} />
        </div>
      ) : (
        ""
      )}
    </>
  )
}

export default Streak
