import React from "react"

import { Link } from "react-router-dom"
import AnimatedPage from "./AnimatedPage"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

function MenuOfflineModes({ setGameMode }) {
  return (
    <AnimatedPage>
      <div className="menu">
        <Link to="/offline/classic">
          <button className="menu__btn--online" onClick={() => setGameMode("offline-classic")}>
            CLASSIC MODE
          </button>
        </Link>

        <button
          className="menu__btn--offline"
          style={{ opacity: "25%" }}
          onClick={() => {
            setGameMode("offline-vsbot")
            console.log("Coming Soon TM")
          }}>
          VS. WORDLEBOT
        </button>

        <Link to="/">
          <button className="menu__btn--back" onClick={() => setGameMode("")}>
            <HiOutlineArrowUturnLeft />
          </button>
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuOfflineModes
