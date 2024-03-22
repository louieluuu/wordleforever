import React from "react"

function Divider({ label = null, margin = "1rem" }) {
  return (
    <div
      className={`divider${label ? "" : "--no-label"}`}
      style={{ marginBlock: margin }}
    >
      {label}
    </div>
  )
}

export default Divider
