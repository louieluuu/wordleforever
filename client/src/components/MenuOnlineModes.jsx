import React from "react"
import { Link } from "react-router-dom"

import { HiOutlineArrowUturnLeft } from "react-icons/hi2"

import AnimatedPage from "./AnimatedPage"

function MenuOnlineModes({ seekMatch, createRoom }) {
  return (
    <AnimatedPage>
      <div className="menu">
        <button className="menu__btn--online" onClick={() => seekMatch()}>
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
