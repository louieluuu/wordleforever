import React, { useState } from "react"
import { Link } from "react-router-dom"
import ChallengeForm from "./ChallengeForm"

function MenuLandingPage() {
  const [showChallengeForm, setShowChallengeForm] = useState(false)

  return (
    <>
      <ChallengeForm isVisible={showChallengeForm} />

      <div className="menu">
        <Link to="/online">
          <button className="menu__btn--online" onClick={() => setShowChallengeForm(true)}>
            PLAY ONLINE
          </button>
        </Link>

        <Link to="/offline">
          <button className="menu__btn--offline" onClick={() => setShowChallengeForm(true)}>
            OFFLINE
          </button>
        </Link>
      </div>
    </>
  )
}

export default MenuLandingPage
