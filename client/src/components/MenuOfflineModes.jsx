import React from "react"
import { Link } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

// Components
import AnimatedPage from "./AnimatedPage"

function MenuOfflineModes({ setConnectionMode, setRoomId }) {
  useSetRoomId(setRoomId)

  return (
    <AnimatedPage>
      <div className="menu">
        <Link
          to="/offline/classic"
          className="menu__btn--online"
          onClick={() => setConnectionMode("offline")}
        >
          CLASSIC MODE
        </Link>

        <Link
          to="/offline"
          className="menu__btn--offline"
          style={{ opacity: "25%" }}
          onClick={() => setConnectionMode("offline-bot")}
        >
          VS. WORDLEBOT
        </Link>

        <Link to="/" className="menu__btn--back">
          <HiOutlineArrowUturnLeft className="menu__btn--back--icon" />
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuOfflineModes
