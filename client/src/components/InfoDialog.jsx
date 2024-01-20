import React, { useRef } from "react"
import { Dialog } from "@headlessui/react"

import { TfiClose } from "react-icons/tfi"

// TODO: LOUIE - animate the dialog upon open and close

function InfoDialog({ show }) {
  const closeButtonRef = useRef(null)

  return (
    <Dialog
      className="dialog"
      open={true}
      onClose={() => show(false)}
      initialFocus={closeButtonRef}
    >
      <Dialog.Panel>
        <div className="dialog__right">
          <div ref={closeButtonRef}>
            <TfiClose
              className="dialog__btn--close"
              onClick={() => show(false)}
            />
          </div>
        </div>

        <Dialog.Title
          style={{
            fontFamily: "Calistoga",
            marginTop: "0.5rem",
            marginBottom: "0",
          }}
        >
          The Ultimate Multiplayer Wordle experience.
        </Dialog.Title>
        <Dialog.Description
          style={{
            fontWeight: "100",
            fontFamily: "Roboto Slab",
            fontSize: "1.15rem",
            marginTop: "0rem",
          }}
        >
          Race against the clock.
        </Dialog.Description>

        <ul
          style={{
            maxWidth: "20rem",
            fontSize: "0.90rem",
            paddingBottom: 0,
            paddingLeft: "1rem",
          }}
        >
          <li style={{ marginBottom: "0.1rem" }}>
            Invite your friends to a private lobby.
          </li>
          <li style={{ marginBottom: "0.1rem" }}>
            Go solo, and see how high you can streak.
          </li>
          <li>Statistics, QOL features, and more!</li>
        </ul>

        <hr style={{ marginBlock: "1.3rem" }} />

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
          Guess a word, and watch the tiles change color.
        </Dialog.Description>

        <p style={{ fontWeight: "bold" }}>Examples</p>

        <div className="game-board__row" style={{ gap: "0.2rem" }}>
          <div className="game-board__cell--dialog--green">S</div>
          <div className="game-board__cell--dialog">H</div>
          <div className="game-board__cell--dialog">O</div>
          <div className="game-board__cell--dialog">R</div>
          <div className="game-board__cell--dialog">E</div>
        </div>

        <p>
          <b>S</b>
          &nbsp;is in the word, and in the correct spot.
        </p>

        <div className="game-board__row" style={{ gap: "0.2rem" }}>
          <div className="game-board__cell--dialog">E</div>
          <div className="game-board__cell--dialog">E</div>
          <div className="game-board__cell--dialog--yellow">F</div>
          <div className="game-board__cell--dialog">J</div>
          <div className="game-board__cell--dialog">E</div>
        </div>

        <p>
          <b>F</b>
          &nbsp;is in the word, but in the wrong spot.
        </p>

        <div className="game-board__row" style={{ gap: "0.2rem" }}>
          <div className="game-board__cell--dialog">V</div>
          <div className="game-board__cell--dialog">A</div>
          <div className="game-board__cell--dialog">R</div>
          <div className="game-board__cell--dialog--grey">U</div>
          <div className="game-board__cell--dialog">S</div>
        </div>

        <p>
          <b>U</b>
          &nbsp;is not in the word at all.
        </p>

        <hr style={{ marginBlock: "1.3rem" }} />

        <p style={{ fontSize: "0.8rem" }}>
          <b>
            <i>Wordle Forever</i>
          </b>
          &nbsp;is our love letter to&nbsp;
          <a href="https://www.nytimes.com/games/wordle/index.html">
            <i>Wordle</i>
          </a>{" "}
          by Josh Wardle. Open source and hosted on&nbsp;
          <a href="https://github.com/louieluuu/wordle-forever">Github</a>
          .&nbsp;Your feedback is appreciated. Feel free to reach out via{" "}
          <a href="mailto:wordleforever@gmail.com">email</a>. Created by Louie
          Lu and Thomas Chiu,&nbsp;
          <span style={{ fontSize: "0.7rem" }}>2023-2024</span>.
        </p>
      </Dialog.Panel>
    </Dialog>
  )
}

export default InfoDialog
