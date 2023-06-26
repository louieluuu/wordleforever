import React, { useState } from "react"
import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { Link } from "react-router-dom"

function MenuOfflineModes({ setIsChallengeMode }) {
  return (
    <div className="menu">
      <button className="menu__btn--online">CLASSIC MODE</button>
      <button className="menu__btn--offline" onClick={() => console.log("No")}>
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
