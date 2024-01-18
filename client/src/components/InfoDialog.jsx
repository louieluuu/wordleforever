import React, { useState, useRef } from "react"
import { Dialog } from "@headlessui/react"

import { IoCloseSharp } from "react-icons/io5"

function InfoDialog({ show }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Dialog className="dialog__info" open={isOpen} onClose={() => show(false)}>
      <Dialog.Panel>
        <div className="dialog__right">
          <IoCloseSharp
            className="dialog__btn--close"
            onClick={() => show(false)}
          />
        </div>

        <Dialog.Title
          style={{
            fontFamily: "Calistoga",
            marginTop: "0.5rem",
            marginBottom: "0",
          }}
        >
          How To Play
        </Dialog.Title>
        <Dialog.Description
          style={{
            fontWeight: "100",
            fontFamily: "Roboto Slab",
            fontSize: "1.15rem",
            marginTop: "0rem",
          }}
        >
          Guess the Wordle in 6 tries.
        </Dialog.Description>

        <ul
          style={{ fontSize: "0.90rem", paddingBottom: 0, paddingLeft: "1rem" }}
        >
          <li style={{ marginBottom: "0.1rem" }}>
            Each guess must be a valid 5-letter word.
          </li>
          <li>
            The color of the tiles will change to show how close<br></br>your
            guess was to the word.
          </li>
        </ul>

        <p style={{ fontWeight: "bold" }}>Examples</p>

        <p>
          <b>W</b>
          &nbsp;is in the word and in the correct spot.
        </p>

        <p>
          <b>I</b>
          &nbsp;is in the word but in the wrong spot.
        </p>

        <p>
          <b>U</b>
          &nbsp;is not in the word at all.
        </p>

        <hr style={{ marginBlock: "1.3rem" }} />

        <p>
          <b>
            <i>Wordle Forever</i>
          </b>
          &nbsp;is an open source project hosted on&nbsp;
          <a href="https://github.com/louieluuu/wordle-forever">Github</a>
          .&nbsp;Your feedback is appreciated. Feel free to reach out via{" "}
          <a href="mailto:louie_lu@sfu.ca">e-mail</a> with comments,
          suggestions, or bug reports.
        </p>
      </Dialog.Panel>
    </Dialog>
  )
}

export default InfoDialog
