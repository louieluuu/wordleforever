import React, { useState } from 'react'

import { IoMenu } from 'react-icons/io5'
import { FaRegCircleQuestion } from 'react-icons/fa6'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { FaGear } from 'react-icons/fa6'

import InfoModal from './InfoModal'

function NavBar() {
  const [showInfoModal, setShowInfoModal] = useState(false)

  const openInfoModal = () => {
    console.log("test");
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  return (
    <>
    <div className="navbar">
        <div className="navbar__top">
            <div className="title">
                Wordle Battle
            </div>
        </div>
        <div className="navbar__bottom">
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