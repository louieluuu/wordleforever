import React from "react"

import { LuClock12 } from "react-icons/lu"

function PrivateRoomInfo({
  connectionMode,
  roundCounter,
  timerIndex,
  roundTimer,
  maxRounds,
}) {
  return (
    <>
      {connectionMode === "online-private" && roundCounter !== 0 && (
        <div className="private-room-info">
          <span className="round-counter">
            Round: {roundCounter}/{maxRounds}
          </span>
          <span className="timer">
            <span className="clock">
              <LuClock12
                style={{
                  transform: `rotate(${360 - timerIndex * 90}deg)`,
                }}
              />
              &nbsp;
            </span>
            {roundTimer}
          </span>
        </div>
      )}
    </>
  )
}

export default PrivateRoomInfo
