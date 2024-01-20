import React from "react"
import { useNavigate } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

// Components
import AnimatedPage from "./AnimatedPage"

function MenuOfflineModes({ setConnectionMode, setRoomId }) {
  useSetRoomId(setRoomId)

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

        <div className="menu__btn--back">
          <HiOutlineArrowUturnLeft
            className="menu__btn--back--icon"
            onClick={navigateBack}
          />
        </div>
      </div>
    </AnimatedPage>
  )
}

export default MenuOfflineModes
