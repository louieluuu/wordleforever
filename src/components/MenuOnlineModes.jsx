import React, { useState } from "react"
import { Link } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import RoomModal from "./RoomModal"

function MenuOnlineModes({ setIsChallengeMode }) {
  const [showRoomModal, setShowRoomModal] = useState(false)

  return (
    <>
      <div className="menu">
        <button className="menu__btn--online" onClick={() => console.log("random")}>
          QUICK START
        </button>
        <button className="menu__btn--offline" onClick={() => setShowRoomModal(true)}>
          CREATE A ROOM
        </button>
        <Link to="/">
          <button className="menu__btn--back">
            <HiOutlineArrowUturnLeft />
          </button>
        </Link>

        {showRoomModal && <RoomModal setShowRoomModal={setShowRoomModal} />}
      </div>
    </>
  )
}

export default MenuOnlineModes
