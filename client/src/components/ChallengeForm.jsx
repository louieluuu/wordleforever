import React from "react"

import { BsFillQuestionCircleFill } from "react-icons/bs"
import { FaQuestionCircle } from "react-icons/fa"
import { Tooltip } from "react-tooltip"

// TODO Might as well put this in scss since the challenge color's already there...
const formStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Roboto Slab",
  paddingBottom: "0.5rem",
}

function ChallengeForm({ isChallengeOn, setIsChallengeOn }) {
  function handleClick() {
    setIsChallengeOn((prev) => !prev)

    // localStorage stores items as strings, so we use JSON.parse to convert it back to bool
    const previousBool = JSON.parse(localStorage.getItem("isChallengeOn"))
    localStorage.setItem("isChallengeOn", !previousBool)
  }

  return (
    <div style={formStyle}>
      <form className="challenge__label">
        <label className="challenge__label">
          <input
            type="checkbox"
            className="challenge__checkbox"
            checked={isChallengeOn}
            onChange={handleClick}
          />
          &nbsp;Challenge Mode&nbsp;
        </label>

        <a
          data-tooltip-id="challenge-tooltip"
          style={{ verticalAlign: "middle" }}
        >
          <FaQuestionCircle
            className="challenge__question-circle"
            color="hsl(0,0%,50%)"
          />
        </a>
        <Tooltip id="challenge-tooltip" className="challenge__tooltip">
          <ul
            style={{
              fontSize: "0.95rem",
              paddingLeft: "1rem",
              margin: "0.7rem",
              fontFamily: "Roboto",
            }}
          >
            <li>random starting word</li>
            <li>must use previous hints</li>
            <li>will only match vs others with same mode</li>
          </ul>
        </Tooltip>
      </form>
    </div>
  )
}

export default ChallengeForm
