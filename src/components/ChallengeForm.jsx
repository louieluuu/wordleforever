import React from "react"

import { FaQuestionCircle } from "react-icons/fa"

const formStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Roboto Slab",
  paddingBottom: "0.5rem",
}

function ChallengeForm() {
  return (
    <form>
      <label style={formStyle}>
        <input type="checkbox" />
        &nbsp;Challenge Mode&nbsp; <FaQuestionCircle />
      </label>
    </form>
  )
}

export default ChallengeForm
