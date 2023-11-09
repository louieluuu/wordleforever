import React, { useState, useEffect } from 'react'

import { MdOutlineBackspace } from 'react-icons/md'
import { AiOutlineEnter } from 'react-icons/ai'

function Keyboard() {
    const [pressedKey, setPressedKey] = useState(null);

  return (
    <div className="keyboard">
        <div className="keyboard__row">
            <div className="keyboard__tile"> Q </div>
            <div className="keyboard__tile"> W </div>
            <div className="keyboard__tile"> E </div>
            <div className="keyboard__tile"> R </div>
            <div className="keyboard__tile"> T </div>
            <div className="keyboard__tile"> Y </div>
            <div className="keyboard__tile"> U </div>
            <div className="keyboard__tile"> I </div>
            <div className="keyboard__tile"> O </div>
            <div className="keyboard__tile"> P </div>
        </div>
        <div className="keyboard__row">
            <div className="keyboard__tile"> A </div>
            <div className="keyboard__tile"> S </div>
            <div className="keyboard__tile"> D </div>
            <div className="keyboard__tile"> F </div>
            <div className="keyboard__tile"> G </div>
            <div className="keyboard__tile"> H </div>
            <div className="keyboard__tile"> J </div>
            <div className="keyboard__tile"> K </div>
            <div className="keyboard__tile"> L </div>
        </div>
        <div className="keyboard__row">
            < AiOutlineEnter className="keyboard__tile" />
            <div className="keyboard__tile"> Z </div>
            <div className="keyboard__tile"> X </div>
            <div className="keyboard__tile"> C </div>
            <div className="keyboard__tile"> V </div>
            <div className="keyboard__tile"> B </div>
            <div className="keyboard__tile"> N </div>
            <div className="keyboard__tile"> M </div>
            < MdOutlineBackspace className="keyboard__tile" />
        </div>
    </div>
  )
}

export default Keyboard