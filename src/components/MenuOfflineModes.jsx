import React, { useState } from "react"
import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { Link } from "react-router-dom"
import AnimatedPage from "./AnimatedPage"

function MenuOfflineModes({ startNewClassicGame }) {
  return (
    <AnimatedPage>
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
    </AnimatedPage>
  )
}

export default MenuOfflineModes
