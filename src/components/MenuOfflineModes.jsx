import React, { useState } from "react"
import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { Link } from "react-router-dom"
import AnimatedPage from "./AnimatedPage"

function MenuOfflineModes({ setMode, handleNewGame }) {
  function handleClick(mode) {
    setMode(mode)
    handleNewGame()
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={() => handleClick("offline-classic")}>
          CLASSIC MODE
        </button>
        <button
          className="menu__btn--offline"
          style={{ opacity: "25%" }}
          onClick={() => console.log("Coming Soon TM")}>
          VS. WORDLEBOT
        </button>

        <Link to="/">
          <button className="menu__btn--back" onClick={() => handleClick("offline-vsBot")}>
            <HiOutlineArrowUturnLeft />
          </button>
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuOfflineModes
