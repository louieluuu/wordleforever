import React, { useState, useEffect } from 'react'

import { MdOutlineBackspace } from 'react-icons/md'
import { AiOutlineEnter } from 'react-icons/ai'

function Keyboard({ handleKeyPress, hints }) {

    useEffect(() => {
        function onKeyPress(e) {
            handleKeyPress(e.key)
        }

        window.addEventListener('keydown', onKeyPress)

        return () => {
            window.removeEventListener('keydown', onKeyPress)
        }
    }, [handleKeyPress])

    function getCellClassName(letter) {
        let tileClassName = "keyboard__cell"

        if (hints.green.has(letter)) {
            tileClassName += "--green"
        } else if (hints.yellow.has(letter)) {
            tileClassName += "--yellow"
        } else if (hints.grey.has(letter)) {
            tileClassName += "--grey"
        }

        return tileClassName
    }

    const topRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
    const midRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
    const botRow = ["Z", "X", "C", "V", "B", "N", "M"]

  return (
    <div className="keyboard">
        <div className="keyboard__row">
            {topRow.map((letter, index) => (
                <div key={index} className={getCellClassName(letter)}> {letter} </div>
            ))}
        </div>
        <div className="keyboard__row">
            {midRow.map((letter, index) => (
                <div key={index} className={getCellClassName(letter)}> {letter} </div>
            ))}
        </div>
        <div className="keyboard__row">
            < AiOutlineEnter className="keyboard__cell" />
            {botRow.map((letter, index) => (
                <div key={index} className={getCellClassName(letter)}> {letter} </div>
            ))}
            < MdOutlineBackspace className="keyboard__cell" />
        </div>
    </div>
  )
}

export default Keyboard