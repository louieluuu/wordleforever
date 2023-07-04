import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({ setIsHost, isChallengeOn, nickname, setGameMode }) {
  const navigate = useNavigate()

  function handleClick(gameMode) {
    setGameMode(gameMode)

    if (gameMode === "online-public") {
      seekMatch()
    }
    //
    else if (gameMode === "online-private") {
      createRoom(gameMode)
    }
  }

  function seekMatch() {
    socket.emit("seekMatch", isChallengeOn)
  }

  function createRoom(gameMode) {
    socket.emit("createRoom", socket.id, nickname, gameMode, isChallengeOn)

    socket.on("roomCreated", (roomId) => {
      setIsHost(true)
      navigate(`/room/${roomId}`)
    })
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={() => handleClick("online-public")}>
          FIND A MATCH
        </button>
        <button className="menu__btn--offline" onClick={() => handleClick("online-private")}>
          <span style={{ lineHeight: "0" }}>PLAY WITH FRIENDS</span>
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
