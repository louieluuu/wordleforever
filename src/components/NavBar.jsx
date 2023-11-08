import React, { useState } from 'react'
import { IoMenu } from 'react-icons/io5'
import { FaRegCircleQuestion } from 'react-icons/fa6'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { FaGear } from 'react-icons/fa6'

function NavBar() {
  return (
    <>
    {/* NavBar */}

    <div className="navbar">
        <div className="navbar__top">
            <div className="title">
                Wordle Battle
            </div>
        </div>
        <div className="navbar__bottom">
          < FaRegCircleQuestion />
          < MdOutlineLeaderboard />
          < FaGear />
        </div>
      </div>
    </>
  )
}

export default NavBar