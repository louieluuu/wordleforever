import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({
  setIsHost,
  isChallengeOn,
  nickname,
  setGameMode,
  seekMatch,
  createRoom,
}) {
  const navigate = useNavigate()

  // Socket cleanup
  useEffect(() => {
    return () => {
      socket.off("noMatchesFound")
      socket.off("matchFound")
      socket.off("roomCreated")
    }
  }, [])

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
