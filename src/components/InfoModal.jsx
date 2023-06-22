import React, { useState } from "react"

import { IoCloseSharp } from "react-icons/io5"

function InfoModal({ setIsDialogOpen }) {
  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <div>
      <dialog className="dialog" open={true} onClose={closeDialog}>
        <IoCloseSharp className="dialog__btn--close" onClick={closeDialog} />
        <h2 style={{ marginBottom: 0, fontFamily: "Calistoga" }}>How To Play</h2>
        <h3
          style={{
            fontWeight: 100,
            marginTop: 0,
            fontFamily: "Roboto Slab",
            fontSize: "1.2rem",
          }}>
          Guess the Wordle in 6 tries.
        </h3>
        <ul style={{ paddingLeft: "1rem", fontSize: "0.90rem" }}>
          <li>Each guess must be a valid 5-letter word.</li>
          <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>

        <p style={{ fontSize: "0.90rem", fontWeight: "bold" }}>Examples</p>

        <p style={{ fontSize: "0.90rem" }}>
          <span style={{ fontWeight: "bold" }}>W </span>
          is in the word and in the correct spot.
        </p>

        <p style={{ fontSize: "0.90rem" }}>
          <span style={{ fontWeight: "bold" }}>I </span>
          is in the word but in the wrong spot.
        </p>

        <p style={{ fontSize: "0.90rem" }}>
          <span style={{ fontWeight: "bold" }}>U </span>
          is not in the word at all.
        </p>
      </dialog>
    </div>
  )
}

export default InfoModal
