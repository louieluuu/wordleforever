import React, { useState } from "react"
import { Link } from "react-router-dom"
import ChallengeForm from "./ChallengeForm"

function MenuLandingPage() {
  return (
    <>
      <ChallengeForm />

      <div className="menu">
        <Link to="/online">
          <button className="menu__btn--online">PLAY ONLINE</button>
        </Link>

        <Link to="/offline">
          <button className="menu__btn--offline">OFFLINE</button>
        </Link>
      </div>
    </>
  )
}

export default MenuLandingPage
