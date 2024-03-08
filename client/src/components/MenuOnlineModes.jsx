import React from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

// Components
import AnimatedPage from "./AnimatedPage"

// Helpers
import {
  handleStartPrivateGame,
  handleStartPublicGame,
} from "../helpers/socketHelpers"
import useSetRoomId from "../helpers/useSetRoomId"

function MenuOnlineModes({
  gameMode,
  setConnectionMode,
  setIsHost,
  setRoomId,
}) {
  useSetRoomId(setRoomId)

  const navigate = useNavigate()

  async function selectPublicGame() {
    setConnectionMode("public")
    const publicRoomId = await handleStartPublicGame(gameMode)
    navigate(`/room/${publicRoomId}`)
  }

  async function selectPrivateGame() {
    setConnectionMode("private")
    const privateRoomId = await handleStartPrivateGame(gameMode, setIsHost)
    navigate(`/room/${privateRoomId}`)
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={selectPublicGame}>
          FIND A MATCH
        </button>

        <button className="menu__btn--offline" onClick={selectPrivateGame}>
          PLAY WITH FRIENDS
        </button>

        <Link to="/" className="menu__btn--back">
          <HiOutlineArrowUturnLeft className="menu__btn--back--icon" />
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuOnlineModes
