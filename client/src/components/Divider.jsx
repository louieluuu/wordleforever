import React from "react"

function Divider({ label = null, margin = "0rem" }) {
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
