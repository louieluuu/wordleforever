import React from "react"

function Divider({ label = null }) {
  return <div className={`divider${label ? "" : "--no-label"}`}>{label}</div>
}

export default Divider
