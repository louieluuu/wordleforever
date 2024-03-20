import React, { useRef } from "react"
import Divider from "./Divider"

// MantineUI Component
import { Modal } from "@mantine/core"
import "@mantine/core/styles/Modal.css"
import "@mantine/core/styles/UnstyledButton.css"
import "@mantine/core/styles/CloseButton.css"
import "@mantine/core/styles/Overlay.css"
import "@mantine/core/styles/ModalBase.css"

// import "../styles/components/_segmented-control.scss"

import { TfiClose } from "react-icons/tfi"

function InfoDialog2({ show, setShow }) {
  console.log(`show: ${show}`)

  const closeButtonRef = useRef(null)

  function closeDialog() {
    setShow(false)
  }

  // TODO: Consider:
  // size="auto"

  return (
    <>
      <Modal opened={show} onClose={closeDialog}>
        {/* <div className="dialog__right">
            <div ref={closeButtonRef}>
              <TfiClose
                className="dialog__btn--close"
                onClick={() => setShow(false)}
              />
            </div>
          </div> */}

        <div
          style={{
            fontFamily: "Calistoga",
            marginTop: "0.5rem",
            marginBottom: "0",
          }}
        >
          The Ultimate Multiplayer Wordle experience.
        </div>
        <div
          style={{
            fontWeight: "100",
            fontFamily: "Roboto Slab",
            fontSize: "1.15rem",
            marginTop: "0rem",
          }}
        >
          Race against the clock.
        </div>
        <ul
          style={{
            maxWidth: "20rem",
            fontSize: "0.90rem",
            paddingBottom: 0,
            paddingLeft: "1rem",
          }}
        >
          <li style={{ marginBottom: "0.1rem" }}>
            ... Invite your friends to a private lobby.
          </li>
          <li style={{ marginBottom: "0.1rem" }}>
            ... Go solo, and see how high you can streak.
          </li>
          <li>... Statistics, QOL features, and more!</li>
        </ul>

        <Divider />

        <div
          style={{
            fontFamily: "Calistoga",
            marginTop: "0.5rem",
            marginBottom: "0",
          }}
        >
          How To Play
        </div>

        <div
          style={{
            fontWeight: "100",
            fontFamily: "Roboto Slab",
            fontSize: "1.15rem",
            marginTop: "0rem",
          }}
        >
          Guess a word, and watch the tiles change color.
        </div>

        <p style={{ fontWeight: "bold" }}>Examples</p>

        <div className="game-board__row" style={{ gap: "0.3rem" }}>
          <div className="game-board__cell--dialog--green">S</div>
          <div className="game-board__cell--dialog">L</div>
          <div className="game-board__cell--dialog">E</div>
          <div className="game-board__cell--dialog">E</div>
          <div className="game-board__cell--dialog">P</div>
        </div>

        <p>
          <b>S</b>
          &nbsp;is in the word, and in the correct spot.
        </p>

        <div className="game-board__row" style={{ gap: "0.3rem" }}>
          <div className="game-board__cell--dialog">L</div>
          <div className="game-board__cell--dialog">O</div>
          <div className="game-board__cell--dialog--yellow">F</div>
          <div className="game-board__cell--dialog">T</div>
          <div className="game-board__cell--dialog">Y</div>
        </div>

        <p>
          <b>F</b>
          &nbsp;is in the word, but in the wrong spot.
        </p>

        <div className="game-board__row" style={{ gap: "0.3rem" }}>
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

        <Divider />

        <p style={{ fontSize: "0.8rem" }}>
          <b>
            <i>Wordle Forever</i>
          </b>
          &nbsp;is our love letter to&nbsp;
          <a
            className="text-link"
            href="https://www.nytimes.com/games/wordle/index.html"
          >
            <i>Wordle</i>
          </a>{" "}
          by Josh Wardle. Open source and hosted on&nbsp;
          <a
            className="text-link"
            href="https://github.com/louieluuu/wordle-forever"
          >
            Github
          </a>
          .&nbsp;Your feedback is appreciated. Feel free to reach out via{" "}
          <a className="text-link" href="mailto:wordleforever@gmail.com">
            email
          </a>
          . Created by Louie Lu and Thomas Chiu,&nbsp;
          <span style={{ fontSize: "0.7rem" }}>2023-2024</span>.
        </p>
      </Modal>
    </>
  )
}

export default InfoDialog2
