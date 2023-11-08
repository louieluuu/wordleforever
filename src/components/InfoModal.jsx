import React from 'react'

import { IoCloseSharp } from "react-icons/io5"

function InfoModal({ show, handleClose }) {
    const handleInfoModalClose = () => {
      handleClose();
    };
  
    return (
      <div className={show ? "modal display" : "modal hide"}>
        <div className="info">
          <div className="info__close">
            <IoCloseSharp onClick={handleInfoModalClose} />
          </div>
          <h1 style={{ marginBottom: 0, fontFamily: "Merriweather" }}>How To Play</h1>
          <h3
          style={{
            fontWeight: 100,
            marginTop: 0,
            marginBottom: 0,
            fontFamily: "Roboto Slab",
            fontSize: "1.5rem",
          }}>
          Guess the Wordle in 6 tries.
          </h3>
          <ul>
            <li>Each guess must be a valid 5-letter word.</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
          </ul>
          <p><b>W</b> is in the word and in the correct spot.</p>
          <p><b>I</b> is in the word but in the wrong spot.</p>
          <p><b>U</b> is not in the word in any spot.</p>
          
        </div>
      </div>
    );
  }
  
  export default InfoModal;