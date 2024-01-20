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
          <span>PLAY WITH FRIENDS</span>
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

export default MenuOnlineModes
