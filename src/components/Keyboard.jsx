import React, { useState, useEffect } from 'react'

import { MdOutlineBackspace } from 'react-icons/md'
import { AiOutlineEnter } from 'react-icons/ai'

function Keyboard({ handleKeyPress }) {

    useEffect(() => {
        function onKeyPress(e) {
            handleKeyPress(e.key)
        }

        window.addEventListener('keydown', onKeyPress)

        return () => {
            window.removeEventListener('keydown', onKeyPress)
        }
    }, [handleKeyPress])

    const topRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
    const midRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
    const botRow = ["Z", "X", "C", "V", "B", "N", "M"]

  return (
    <div className="keyboard">
        <div className="keyboard__row">
            {topRow.map((letter, index) => (
                <div key={index} className="keyboard__tile"> {letter} </div>
            ))}
        </div>
        <div className="keyboard__row">
            {midRow.map((letter, index) => (
                <div key={index} className="keyboard__tile"> {letter} </div>
            ))}
        </div>
        <div className="keyboard__row">
            < AiOutlineEnter className="keyboard__tile" />
            {botRow.map((letter, index) => (
                <div key={index} className="keyboard__tile"> {letter} </div>
            ))}
            < MdOutlineBackspace className="keyboard__tile" />
        </div>
    </div>
  )
}

export default Keyboard