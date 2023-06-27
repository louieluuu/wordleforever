import React, { useState } from "react"
import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { Link } from "react-router-dom"

function MenuOfflineModes({ startNewClassicGame }) {
  return (
    <div className="menu">
      <button className="menu__btn--online" onClick={startNewClassicGame}>
        CLASSIC MODE
      </button>
      <button
        className="menu__btn--offline"
        style={{ opacity: "25%" }}
        onClick={() => console.log("No")}>
        VS. WORDLEBOT
      </button>

      <Link to="/">
        <button className="menu__btn--back">
          <HiOutlineArrowUturnLeft />
        </button>
      </Link>
    </div>
  )
}

export default MenuOfflineModes
