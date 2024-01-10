import React from "react"
import { useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

// Components
import AnimatedPage from "./AnimatedPage"

function MenuOfflineModes({ setConnectionMode }) {
  const navigate = useNavigate()

  function selectClassicMode() {
    setConnectionMode("offline")
    navigate("/offline/classic")
  }

  function selectVsBot() {
    setConnectionMode("offline-bot")
    // navigate('/offline/wordlebot')
  }

  function navigateBack() {
    navigate("/")
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={selectClassicMode}>
          CLASSIC MODE
        </button>

        <button
          className="menu__btn--offline"
          style={{ opacity: "25%" }}
          onClick={selectVsBot}
        >
          VS. WORDLEBOT
        </button>

        <button className="menu__btn--back" onClick={navigateBack}>
          <HiOutlineArrowUturnLeft />
        </button>
      </div>
    </AnimatedPage>
  )
}

export default MenuOfflineModes
