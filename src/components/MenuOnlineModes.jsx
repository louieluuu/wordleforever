import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import { socket } from "../socket"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({ setIsHost, isChallengeOn, nickname, setGameMode }) {
  const navigate = useNavigate()

  function seekMatch() {
    socket.emit("seekMatch", isChallengeOn)

    socket.on("noMatchesFound", () => {
      console.log("Received noMatchesFound. Creating online-public room...\n")
      createRoom("online-public")
    })

    socket.on("matchFound", (roomId) => {
      console.log("MATCHFOUND MATCH FOUND MATCH FOUND")
      navigate(`/room/${roomId}`)
    })
  }

  function createRoom(gameMode) {
    console.log("createRoom called.")
    setGameMode(gameMode)

    console.log("CALLING CREATEROOM ONCE!!!!!!!!!!!!!!!!!!!!")
    socket.emit("createRoom", socket.id, nickname, gameMode, isChallengeOn)

    socket.on("roomCreated", (roomId) => {
      console.log("roomCreated called.")

      // Only private rooms require hosts. Public rooms will start on a shared timer.
      if (gameMode === "online-private") {
        setIsHost(true)
      }
      navigate(`/room/${roomId}`)
    })
  }

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
