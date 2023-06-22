import React from "react"

import { IoBackspaceOutline } from "react-icons/io5"

export default function Keyboard({ onClick, hints }) {
  function getKeyboardKeyClassName(letter) {
    let keyboardKeyClassName = "keyboard__key"

    // The order of these hints searches matters. Priotizing green.
    if (hints.green.has(letter)) {
      keyboardKeyClassName += "--correct"
    }
    //
    else if (hints.yellow.has(letter)) {
      keyboardKeyClassName += "--wrong-position"
    }
    //
    else if (hints.gray.has(letter)) {
      keyboardKeyClassName += "--wrong"
    }

    return keyboardKeyClassName
  }

  const firstRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]
  const secondRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"]
  const thirdRow = ["Z", "X", "C", "V", "B", "N", "M"]

  return (
    <div className="keyboard">
      <div className="keyboard__row">
        {firstRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => onClick(letter)}>
            {letter}
          </button>
        ))}
      </div>

      <div className="keyboard__row">
        {secondRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => onClick(letter)}>
            {letter}
          </button>
        ))}
      </div>

      <div className="keyboard__row">
        <div className="keyboard__key--large" key="Enter" onClick={() => onClick("Enter")}>
          ENTER
        </div>
        {thirdRow.map((letter) => (
          <button
            className={getKeyboardKeyClassName(letter)}
            key={letter}
            onClick={() => onClick(letter)}>
            {letter}
          </button>
        ))}
        <div
          className="keyboard__key--large--svg"
          key="Backspace"
          onClick={() => onClick("Backspace")}>
          <IoBackspaceOutline />
        </div>
      </div>
    </div>
  )
}
