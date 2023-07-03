import React from "react"
import { Link } from "react-router-dom"
import AnimatedPage from "./AnimatedPage"

import { socket } from "../socket"

function MenuLandingPage() {
  function handleClick() {
    socket.connect()
  }

  return (
    <AnimatedPage>
      <div className="menu">
        <Link to="/online">
          <button className="menu__btn--online">ONLINE</button>
        </Link>

        <Link to="/offline">
          <button className="menu__btn--offline">OFFLINE</button>
        </Link>
      </div>
    </AnimatedPage>
  )
}

export default MenuLandingPage
