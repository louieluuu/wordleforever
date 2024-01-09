import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaRegCircleQuestion } from 'react-icons/fa6'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { FaGear } from 'react-icons/fa6'

import InfoModal from './InfoModal'

function NavBar({
  setGameMode,
  setConnectionMode,
}) {
  const [showInfoModal, setShowInfoModal] = useState(false)
  const navigate = useNavigate()

  function openInfoModal() {
    setShowInfoModal(true)
  }

  function closeInfoModal() {
    setShowInfoModal(false)
  }

  function handleTitleClick() {
    setGameMode('Easy')
    setConnectionMode('offline')
    // Surely this is not the best fix, or even a fix at all, but without the timeout, some errors appear in console before the page refresh
    setTimeout(() => {
      window.location.href = '/'
    }, 0)
  }

  return (
    <>
      <div className='navbar'>
        <div className='navbar__left'>
          <Link to='/' onClick={handleTitleClick} className='title'>
            Wordle Battle
          </Link>
        </div>
        <div className='navbar__right'>
          <FaRegCircleQuestion className='navbar__info' onClick={openInfoModal} />
          <MdOutlineLeaderboard />
          <FaGear />
        </div>
        <InfoModal show={showInfoModal} handleClose={closeInfoModal} />
      </div>
    </>
  )
}

export default NavBar
