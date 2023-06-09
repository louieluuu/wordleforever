import React from "react"

import { IoBackspaceOutline } from "react-icons/io5"

export default function Keyboard() {
  return (
    <div className="keyboard">
      <div className="keyboard__row">
        <div className="keyboard__key">Q</div>
        <div className="keyboard__key">W</div>
        <div className="keyboard__key">E</div>
        <div className="keyboard__key">R</div>
        <div className="keyboard__key">T</div>
        <div className="keyboard__key">Y</div>
        <div className="keyboard__key">U</div>
        <div className="keyboard__key">I</div>
        <div className="keyboard__key">O</div>
        <div className="keyboard__key">P</div>
      </div>

      <div className="keyboard__row">
        <div className="keyboard__key">A</div>
        <div className="keyboard__key">S</div>
        <div className="keyboard__key">D</div>
        <div className="keyboard__key">F</div>
        <div className="keyboard__key">G</div>
        <div className="keyboard__key">H</div>
        <div className="keyboard__key">J</div>
        <div className="keyboard__key">K</div>
        <div className="keyboard__key">L</div>
      </div>

      <div className="keyboard__row">
        <div className="keyboard__key--large">ENTER</div>
        <div className="keyboard__key">Z</div>
        <div className="keyboard__key">X</div>
        <div className="keyboard__key">C</div>
        <div className="keyboard__key">V</div>
        <div className="keyboard__key">B</div>
        <div className="keyboard__key">N</div>
        <div className="keyboard__key">M</div>
        <div className="keyboard__key--large--svg">
          <IoBackspaceOutline />
        </div>
      </div>
    </div>
  )
}
