import React, { useState, useEffect } from "react"

import { LuClock12 } from "react-icons/lu"

function PrivateRoomInfo({
  connectionMode,
  roundCounter,
  timerIndex,
  roundTimer,
  maxRounds,
}) {
  const [hiddenDigits, setHiddenDigits] = useState("")

  // Assuming that the round timer should always be styled for a 3 digit starting value
  useEffect(() => {
    // If round timer drops to 2 digits, add a hidden digit, so the text doesn't shift
    if (roundTimer < 100 && roundTimer > 10) {
      setHiddenDigits("0")
    }
    // If round timer drops to 1 digit, add two hidden digits
    else if (roundTimer < 10) {
      setHiddenDigits("00")
    }
    // No hidden digits if round timer is 3 digits
    else if (roundTimer > 100) {
      setHiddenDigits("")
    }
  }, [roundTimer])
  return (
    <>
      {connectionMode === "online-private" && roundCounter !== 0 && (
        <div className="private-room-info">
          <span className="round-counter">
            Round: {roundCounter}/{maxRounds}
          </span>
          <span
            className={`timer${
              roundTimer <= 15 && roundTimer > 0 ? "-low" : ""
            }`}
          >
            <span className="clock" style={{ verticalAlign: "middle" }}>
              <LuClock12
                style={{
                  transform: `rotate(${360 - timerIndex * 90}deg)`,
                }}
              />
              &nbsp;
            </span>
            {roundTimer}
            <span className="hidden-digits">{hiddenDigits}</span>
          </span>
        </div>
      )}
    </>
  )
}

export default PrivateRoomInfo
