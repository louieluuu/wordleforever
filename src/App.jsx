import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header.jsx"

// react-icon SVGs
import { IoBackspaceOutline } from "react-icons/io5"

function App() {
  const [activeTile, setActiveTile] = useState(0)
  const [activeRow, setActiveRow] = useState(0)
  const [userGuess, setUserGuess] = useState("")
  const [targetWord, setTargetWord] = useState("")
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill(""))
  )

  // const [gridLetter, setGridLetter] = useState("")
  // isGameOver state (?)

  // Game setup on mount
  // -select random word
  // -initialize the gameBoard
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord.toUpperCase())

    console.log(randomWord)
  }, [])

  // The event listener starts firing only after the component is mounted.
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    // If you include a return in useEffect,
    // it will be executed only when the component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeTile])

  function handleKeyDown(e) {
    const isLetterRegex = /^[a-zA-Z]$/

    // Enter
    if (e.key === "Enter") {
      // Guess too short
      if (activeTile < 5) {
        console.log(`key pressed: ${e.key}`)
        console.log(`activeRow: ${activeRow}`)
        console.log(`Not enough letters in: ${userGuess}`)
      }
      // Guess invalid
      else if (!VALID_GUESSES.includes(userGuess.toLowerCase())) {
        console.log(`Guess not in dictionary: ${userGuess}`)
      }
      // Submit guess
      else {
        // Correct guess: gameOver (win)
        if (userGuess === targetWord) {
          console.log(
            `Correct guess: guess: ${userGuess} vs. target: ${targetWord}`
          )
          // TODO: handleGameWin()
          // TODO: unmount() i.e. disable buttons
        }
        // Wrong guess
        else {
          // TODO: if array is full / activeRow > length then gameOver (lose)

          // TODO: ... else, continue the game
          setActiveRow((activeRow) => activeRow + 1)
          setActiveTile(0)
          setUserGuess("")
          console.log(`Valid guess submitted: ${userGuess}`)
          console.log(`activeRow: ${activeRow}`)
          console.log(`activeTile: ${activeTile}`)
        }
      }
    }

    // Backspace
    else if (e.key === "Backspace") {
      if (activeTile !== 0) {
        setActiveTile((activeTile) => activeTile - 1)

        const updatedGameBoard = gameBoard.map(
          (row, rowIndex) =>
            rowIndex === activeRow
              ? row.map(
                  (cell, colIndex) => (colIndex === activeTile - 1 ? "" : cell) // ! activeTile - 1 ? XD
                )
              : row // [... row]?
        )
        setGameBoard(updatedGameBoard)

        setUserGuess(userGuess.slice(0, activeTile - 1)) // ! activeTile - 1 ? XD
        console.log(`activeTile: ${activeTile}`)
        console.log(`key pressed: ${e.key}`)
      }
    }

    // Letters
    else if (isLetterRegex.test(e.key) === true) {
      if (activeTile < 5) {
        const updatedGameBoard = gameBoard.map(
          (row, rowIndex) =>
            rowIndex === activeRow
              ? row.map((cell, colIndex) =>
                  colIndex === activeTile ? "G" : cell
                )
              : row // [... row]?
        )
        setGameBoard(updatedGameBoard)

        console.log(gameBoard)

        setUserGuess(userGuess.concat(e.key.toUpperCase()))
        setActiveTile((activeTile) => activeTile + 1)
        console.log(`activeTile: ${activeTile}`)
        console.log(`key pressed: ${e.key}`)
      }
    }
  }

  return (
    <>
      <Header />

      {/* Game Board */}
      <div className="game-board">
        <div className="guess">
          <div className="guess__box">{gameBoard[0][0]}</div>
          <div className="guess__box">{gameBoard[0][1]}</div>
          <div className="guess__box">{gameBoard[0][2]}</div>
          <div className="guess__box">{gameBoard[0][3]}</div>
          <div className="guess__box">{gameBoard[0][4]}</div>
        </div>

        <div className="guess">
          <div className="guess__box">{gameBoard[1][0]}</div>
          <div className="guess__box">{gameBoard[1][1]}</div>
          <div className="guess__box">{gameBoard[1][2]}</div>
          <div className="guess__box">{gameBoard[1][3]}</div>
          <div className="guess__box">{gameBoard[1][4]}</div>
        </div>

        <div className="guess">
          <div className="guess__box">{gameBoard[2][0]}</div>
          <div className="guess__box">{gameBoard[2][1]}</div>
          <div className="guess__box">{gameBoard[2][2]}</div>
          <div className="guess__box">{gameBoard[2][3]}</div>
          <div className="guess__box">{gameBoard[2][4]}</div>
        </div>

        <div className="guess">
          <div className="guess__box">{gameBoard[3][0]}</div>
          <div className="guess__box">{gameBoard[3][1]}</div>
          <div className="guess__box">{gameBoard[3][2]}</div>
          <div className="guess__box">{gameBoard[3][3]}</div>
          <div className="guess__box">{gameBoard[3][4]}</div>
        </div>

        <div className="guess">
          <div className="guess__box">{gameBoard[4][0]}</div>
          <div className="guess__box">{gameBoard[4][1]}</div>
          <div className="guess__box">{gameBoard[4][2]}</div>
          <div className="guess__box">{gameBoard[4][3]}</div>
          <div className="guess__box">{gameBoard[4][4]}</div>
        </div>

        <div className="guess">
          <div className="guess__box">{gameBoard[5][0]}</div>
          <div className="guess__box">{gameBoard[5][1]}</div>
          <div className="guess__box">{gameBoard[5][2]}</div>
          <div className="guess__box">{gameBoard[5][3]}</div>
          <div className="guess__box">{gameBoard[5][4]}</div>
        </div>
      </div>

      {/* Keyboard */}
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
    </>
  )
}

export default App
