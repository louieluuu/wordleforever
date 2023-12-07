import React, { useEffect } from 'react'

import { MdOutlineBackspace } from 'react-icons/md'
import { AiOutlineEnter } from 'react-icons/ai'

function Keyboard({ handleKeyPress, hints }) {

    useEffect(() => {
        function onKeyPress(e) {
            /* Weird bug / unintended functionality when clicking the letters on the keyboard, which then selects the element, so when pressing 'Enter' it also clicks that previously selected element leading to duplicate letters*/
            if (e.key === 'Enter' && document.activeElement.tagName === 'BUTTON') {
                handleKeyPress(e.key)
                e.preventDefault()
            } else {
                handleKeyPress(e.key)
            }
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
                <button
                    key={index}
                    className={getCellClassName(letter)}
                    onClick={() => handleKeyPress(letter)}>
                    {letter}
                </button>
            ))}
        </div>
        <div className="keyboard__row">
            {midRow.map((letter, index) => (
                <button
                    key={index}
                    className={getCellClassName(letter)}
                    onClick={() => handleKeyPress(letter)}>
                    {letter}
                </button>
            ))}
        </div>
        <div className="keyboard__row">
            < AiOutlineEnter
                className="keyboard__cell"
                onClick={() => handleKeyPress("Enter")}/>
            {botRow.map((letter, index) => (
                <button
                    key={index}
                    className={getCellClassName(letter)}
                    onClick={() => handleKeyPress(letter)}>
                    {letter}
                </button>
            ))}
            < MdOutlineBackspace
                className="keyboard__cell"
                onClick={() => handleKeyPress("Backspace")}/>
        </div>
    </div>
  )
}

export default Keyboard