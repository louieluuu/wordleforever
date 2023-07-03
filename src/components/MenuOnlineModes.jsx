import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({ setIsHost, isChallengeMode, setIsMultiplayer, nickname, setMode }) {
  const navigate = useNavigate()

  function handleClick(mode) {
    setMode(mode)

    if (mode === "online-public") {
      seekMatch()
    }
    //
    else if (mode === "online-private") {
      createRoom()
    }
  }

  function seekMatch() {
    socket.emit("seekMatch", socket.id, nickname, isChallengeMode)

    socket.on("matchFound", (roomId) => {
      setIsMultiplayer(true)
      navigate(`/room/${roomId}`)
      // socket.emit("joinRoom", roomId, socket.id, nickname)
    })
  }

  function createRoom() {
    socket.emit("createRoom", socket.id, nickname, isChallengeMode)

    socket.on("roomCreated", (roomId) => {
      setIsHost(true)
      setIsMultiplayer(true)
      navigate(`/room/${roomId}`)
      // socket.emit("joinRoom", roomId, socket.id, nickname)
    })
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button
          className="menu__btn--online"
          style={{ opacity: "25%" }}
          onClick={() => handleClick("online-public")}>
          QUICK START
        </button>
        <button className="menu__btn--offline" onClick={() => handleClick("online-private")}>
          CREATE A ROOM
        </button>
        <Link to="/">
          <button className="menu__btn--back">
            <HiOutlineArrowUturnLeft strokeWidth={"2px"} />
          </button>
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuOnlineModes
