import React, { useState } from 'react'

import { IoMenu } from 'react-icons/io5'
import { FaRegCircleQuestion } from 'react-icons/fa6'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { FaGear } from 'react-icons/fa6'

import InfoModal from './InfoModal'

function NavBar() {
  const [showInfoModal, setShowInfoModal] = useState(false)

  const openInfoModal = () => {
    setShowInfoModal(true)
  }

  const closeInfoModal = () => {
    setShowInfoModal(false)
  }

  return (
    <>
    <div className="navbar">
        <div className="navbar__left">
            <div className="title">
                Wordle Battle
            </div>
        </div>
        <div className="navbar__right">
          < FaRegCircleQuestion className="navbar__info" onClick={openInfoModal} />
          < MdOutlineLeaderboard />
          < FaGear />
        </div>
        <InfoModal show={showInfoModal} handleClose={closeInfoModal} />
      </div>
    </>
  )
}

export default NavBar