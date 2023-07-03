import React from "react"

import { FaQuestionCircle } from "react-icons/fa"
import { Tooltip } from "react-tooltip"

const formStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Roboto Slab",
  paddingBottom: "0.5rem",
}

function ChallengeForm({ setIsChallengeMode }) {
  function handleClick() {
    setIsChallengeMode((prev) => !prev)
  }

  return (
    <form style={formStyle}>
      <label>
        <input type="checkbox" onChange={handleClick} />
        &nbsp;Challenge Mode&nbsp;
        <a data-tooltip-id="challenge-tooltip" style={{ verticalAlign: "middle" }}>
          <FaQuestionCircle color="hsl(0,0%,22.5%)" />
        </a>
        <Tooltip id="challenge-tooltip">
          <ul style={{ fontSize: "0.85rem", paddingLeft: "1rem", margin: 0 }}>
            <li>random starting word</li>
            <li>must use previous hints</li>
          </ul>
        </Tooltip>
      </label>
    </form>
  )
}

export default ChallengeForm
