import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

function App() {
  const [activeTile, setActiveTile] = useState(0)
  const [activeRow, setActiveRow] = useState(0)
  const [userGuess, setUserGuess] = useState("")
  const [solution, setSolution] = useState("")
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )
  const [isGameOver, setIsGameOver] = useState(false)

  // Game setup on mount
  // -select random word
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setSolution(randomWord.toUpperCase())
    console.log(randomWord)
  }, [])

  // The event listener starts firing only after the component is mounted.
  useEffect(() => {
    if (!isGameOver) {
      window.addEventListener("keydown", handleKeyDown)
    }

    // If you include a return in useEffect,
    // it will be executed only when the component is unmounted
    // isGameOver must be included as a dependency
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeTile, isGameOver])

  // Helper function
  function getGuessTileClassName(row, col) {
    let guessTileClassName = "guess__tile"

    if (!gameBoard[row][col].state) {
      if (activeRow === row && col < userGuess.length && !isGameOver) {
        guessTileClassName += "--active"
      }
    }
    //
    else if (gameBoard[row][col].state === "correct") {
      guessTileClassName += "--correct"
    }
    //
    else if (gameBoard[row][col].state === "wrong-position") {
      guessTileClassName += "--wrong-position"
    }
    //
    else if (gameBoard[row][col].state === "wrong") {
      guessTileClassName += "--wrong"
    }

    return guessTileClassName
  }

  function handleEnter() {
    // Guess too short
    if (activeTile < 5) {
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
      if (userGuess === solution) {
        console.log(
          `Correct guess: guess: ${userGuess} vs. target: ${solution} \n
            You win !! Yay!`
        )
        setIsGameOver(true)
        // despite the game being over, in order to render the colors of the (previous) winning row,
        // the active row must still be incremented once
        setActiveRow((activeRow) => activeRow + 1)
      }
      // Wrong guess
      else {
        // Run out of guesses
        if (activeRow >= 5) {
          console.log(`game over, run out of guesses`)
          setIsGameOver(true)
        }
        // Game continues
        else {
          setActiveRow((activeRow) => activeRow + 1)
          setActiveTile(0)
          setUserGuess("")
          console.log(`Valid guess submitted: ${userGuess}`)
          console.log(`activeTile: ${activeTile}`)
        }
      }
      updateTileStates()
    }
  }

  // Color logic: Three-pass algorithm
  function updateTileStates() {
    console.log(`activeRow: ${activeRow}`)
    console.log(gameBoard)
    let updatedGameBoard = [...gameBoard]

    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]

    // 1: Handle corrects
    updatedGameBoard[activeRow].forEach((tile, tileIndex) => {
      if (tile.letter === copySolution[tileIndex]) {
        updatedGameBoard[activeRow][tileIndex] = { ...tile, state: "correct" }
        copySolution[tileIndex] = null
      }
    })

    // 2: Handle wrong position (yellows)
    updatedGameBoard[activeRow].forEach((tile, tileIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (!tile.state) {
        let includedIndex = copySolution.indexOf(tile.letter)
        if (includedIndex !== -1) {
          updatedGameBoard[activeRow][tileIndex] = { ...tile, state: "wrong-position" }
          copySolution[includedIndex] = null
        }
      }
    })

    // 3: Any remaining tiles are wrong
    updatedGameBoard[activeRow].forEach((tile, tileIndex) => {
      if (!tile.state) {
        updatedGameBoard[activeRow][tileIndex] = { ...tile, state: "wrong" }
      }
    })

    setGameBoard(updatedGameBoard)
  }

  function handleBackspace() {
    if (activeTile !== 0) {
      setActiveTile((activeTile) => activeTile - 1)

      const updatedGameBoard = gameBoard.map(
        (row, rowIndex) =>
          rowIndex === activeRow
            ? row.map((cell, colIndex) =>
                colIndex === activeTile - 1 ? { ...cell, letter: "" } : cell
              )
            : row // TODO: [... row]? UNDERSTAND
      )
      console.log(updatedGameBoard)
      setGameBoard(updatedGameBoard)

      const newGuess = userGuess.slice(0, activeTile - 1)
      console.log(`user guess so far: ${newGuess}`)
      setUserGuess(newGuess)

      console.log(`activeTile changed from: ${activeTile} to ${activeTile - 1}`)
    }
  }

  function handleLetter(letter) {
    if (activeTile < 5) {
      const newGuess = userGuess.concat(letter.toUpperCase())
      setUserGuess(newGuess)

      const updatedGameBoard = gameBoard.map(
        (row, rowIndex) =>
          rowIndex === activeRow
            ? row.map((cell, colIndex) =>
                colIndex === activeTile ? { ...cell, letter: newGuess[activeTile] } : cell
              )
            : row // TODO: [... row]? UNDERSTAND
      )
      console.log(updatedGameBoard)
      setGameBoard(updatedGameBoard)

      setActiveTile((activeTile) => activeTile + 1)

      console.log(`user guess so far: ${newGuess}`)
      console.log(`activeTile changed from: ${activeTile} to ${activeTile + 1}`)
      console.log(`key pressed: ${letter}`)
    }
  }

  function handleKeyDown(e) {
    const isLetterRegex = /^[a-zA-Z]$/

    if (e.key === "Enter") {
      handleEnter()
    }
    //
    else if (e.key === "Backspace") {
      handleBackspace()
    }
    //
    else if (isLetterRegex.test(e.key) === true) {
      handleLetter(e.key)
    }
  }

  function handleKeyboardClick(clicked) {
    if (clicked === "Enter") {
      handleEnter()
    }
    //
    else if (clicked === "Backspace") {
      handleBackspace()
    }
    //
    else {
      handleLetter(clicked)
    }
  }

  return (
    <>
      <Header />

      <div className="game-board">
        <div className="guess">
          <div className={getGuessTileClassName(0, 0)}>{gameBoard[0][0].letter}</div>
          <div className={getGuessTileClassName(0, 1)}>{gameBoard[0][1].letter}</div>
          <div className={getGuessTileClassName(0, 2)}>{gameBoard[0][2].letter}</div>
          <div className={getGuessTileClassName(0, 3)}>{gameBoard[0][3].letter}</div>
          <div className={getGuessTileClassName(0, 4)}>{gameBoard[0][4].letter}</div>
        </div>

        <div className="guess">
          <div className={getGuessTileClassName(1, 0)}>{gameBoard[1][0].letter}</div>
          <div className={getGuessTileClassName(1, 1)}>{gameBoard[1][1].letter}</div>
          <div className={getGuessTileClassName(1, 2)}>{gameBoard[1][2].letter}</div>
          <div className={getGuessTileClassName(1, 3)}>{gameBoard[1][3].letter}</div>
          <div className={getGuessTileClassName(1, 4)}>{gameBoard[1][4].letter}</div>
        </div>

        <div className="guess">
          <div className={getGuessTileClassName(2, 0)}>{gameBoard[2][0].letter}</div>
          <div className={getGuessTileClassName(2, 1)}>{gameBoard[2][1].letter}</div>
          <div className={getGuessTileClassName(2, 2)}>{gameBoard[2][2].letter}</div>
          <div className={getGuessTileClassName(2, 3)}>{gameBoard[2][3].letter}</div>
          <div className={getGuessTileClassName(2, 4)}>{gameBoard[2][4].letter}</div>
        </div>

        <div className="guess">
          <div className={getGuessTileClassName(3, 0)}>{gameBoard[3][0].letter}</div>
          <div className={getGuessTileClassName(3, 1)}>{gameBoard[3][1].letter}</div>
          <div className={getGuessTileClassName(3, 2)}>{gameBoard[3][2].letter}</div>
          <div className={getGuessTileClassName(3, 3)}>{gameBoard[3][3].letter}</div>
          <div className={getGuessTileClassName(3, 4)}>{gameBoard[3][4].letter}</div>
        </div>

        <div className="guess">
          <div className={getGuessTileClassName(4, 0)}>{gameBoard[4][0].letter}</div>
          <div className={getGuessTileClassName(4, 1)}>{gameBoard[4][1].letter}</div>
          <div className={getGuessTileClassName(4, 2)}>{gameBoard[4][2].letter}</div>
          <div className={getGuessTileClassName(4, 3)}>{gameBoard[4][3].letter}</div>
          <div className={getGuessTileClassName(4, 4)}>{gameBoard[4][4].letter}</div>
        </div>

        <div className="guess">
          <div className={getGuessTileClassName(5, 0)}>{gameBoard[5][0].letter}</div>
          <div className={getGuessTileClassName(5, 1)}>{gameBoard[5][1].letter}</div>
          <div className={getGuessTileClassName(5, 2)}>{gameBoard[5][2].letter}</div>
          <div className={getGuessTileClassName(5, 3)}>{gameBoard[5][3].letter}</div>
          <div className={getGuessTileClassName(5, 4)}>{gameBoard[5][4].letter}</div>
        </div>
      </div>

      <Keyboard onClick={handleKeyboardClick} />
    </>
  )
}

export default App
