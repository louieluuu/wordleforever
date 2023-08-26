import React from "react"

import { IoCloseSharp } from "react-icons/io5"

function InfoModal({ setIsDialogOpen }) {
  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  // Styles
  const textContent = {
    fontSize: "0.90rem",
    paddingBottom: "1rem",
  }

  return (
    <div>
      <dialog className="dialog" open={true} onClose={closeDialog}>
        <div className="dialog__right">
          <IoCloseSharp className="dialog__btn--close" onClick={closeDialog} />
        </div>
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
        <ul style={{ ...textContent, paddingBottom: 0, paddingLeft: "1rem" }}>
          <li style={{ marginBottom: "0.1rem" }}>Each guess must be a valid 5-letter word.</li>
          <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>

        <p style={{ ...textContent, fontWeight: "bold" }}>Examples</p>

        <p style={textContent}>
          <span style={{ fontWeight: "bold" }}>W </span>
          is in the word and in the correct spot.
        </p>

        <p style={textContent}>
          <span style={{ fontWeight: "bold" }}>I </span>
          is in the word but in the wrong spot.
        </p>

        <p style={textContent}>
          <span style={{ fontWeight: "bold" }}>U </span>
          is not in the word at all.
        </p>

        <hr />

        <p style={{ ...textContent, paddingBottom: 0 }}>
          Wordle Forever is a multiplayer recreation of{" "}
          <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank">
            Wordle&nbsp;
          </a>
          with additional QOL features. Built from scratch using React and Socket.IO.
        </p>
      </dialog>
    </div>
  )
}

export default InfoModal
