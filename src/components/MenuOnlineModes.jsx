import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({ setIsHost, isChallengeOn, nickname, setGameMode }) {
  const navigate = useNavigate()

  function seekMatch() {
    socket.emit("seekMatch", isChallengeOn)

    socket.on("noMatchesFound", () => {
      createRoom("online-public")
    })

    socket.on("matchFound", (roomId) => {
      navigate(`/room/${roomId}`)
    })
  }

  function createRoom(gameMode) {
    setGameMode(gameMode)

    socket.emit("createRoom", socket.id, nickname, gameMode, isChallengeOn)

    socket.on("roomCreated", (roomId) => {
      // Only private rooms require hosts. Public rooms will start on a shared timer.
      if (gameMode === "online-private") {
        setIsHost(true)
      }
      navigate(`/room/${roomId}`)
    })
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={seekMatch}>
          FIND A MATCH
        </button>
        <button className="menu__btn--offline" onClick={() => createRoom("online-private")}>
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
