import React, { useState } from "react"
import { FaRegCircleQuestion } from "react-icons/fa6"

import InfoModal from "./InfoModal"

function NavBar({ setConnectionMode }) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  function openInfoModal() {
    setShowInfoModal(true)
  }

  function closeInfoModal() {
    setShowInfoModal(false)
  }

  function handleTitleClick() {
    setConnectionMode("offline")
    // Surely this is not the best fix, or even a fix at all, but without the timeout, some errors appear in console before the page refresh
    setTimeout(() => {
      window.location.href = "/"
    }, 0)
  }

  return (
    <>
      <div className="navbar">
        <div className="navbar__left" onClick={handleTitleClick}>
          <div className="logo">
            <div className="logo__wordmark">
              <strong className="logo__wordmark--left">Wordle&nbsp;</strong>
              <strong className="logo__wordmark--right">Forever</strong>
            </div>
          </div>
        </div>
        <div className="navbar__right">
          <FaRegCircleQuestion
            className="navbar__info"
            onClick={openInfoModal}
          />
        </div>
        <InfoModal show={showInfoModal} handleClose={closeInfoModal} />
      </div>
    </>
  )
}

export default NavBar
