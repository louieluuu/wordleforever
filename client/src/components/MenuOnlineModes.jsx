import React from "react"
import { useNavigate } from "react-router-dom"

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
  isChallengeOn,
  setConnectionMode,
  setIsHost,
  setRoomId,
}) {
  useSetRoomId(setRoomId)

  const navigate = useNavigate()

  async function selectPublicGame() {
    setConnectionMode("online-public")
    const publicRoomId = await handleStartPublicGame(isChallengeOn)
    navigate(`/room/${publicRoomId}`)
  }

  async function selectPrivateGame() {
    setConnectionMode("online-private")
    const privateRoomId = await handleStartPrivateGame(isChallengeOn, setIsHost)
    navigate(`/room/${privateRoomId}`)
  }

  function navigateBack() {
    navigate("/")
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={selectPublicGame}>
          FIND A MATCH
        </button>

        <button className="menu__btn--offline" onClick={selectPrivateGame}>
          <span style={{ lineHeight: "0" }}>PLAY WITH FRIENDS</span>
        </button>

        <button className="menu__btn--back" onClick={navigateBack}>
          <HiOutlineArrowUturnLeft strokeWidth={"2px"} />
        </button>
      </div>
    </AnimatedPage>
  )
}

export default MenuOnlineModes
