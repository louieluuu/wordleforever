import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

function App() {
  const [activeRow, setActiveRow] = useState(0)
  const [activeTile, setActiveTile] = useState(0)
  const [userGuess, setUserGuess] = useState("")
  const [solution, setSolution] = useState("")
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )
  const [isGameOver, setIsGameOver] = useState(false)

  // Select random word upon mount
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setSolution(randomWord.toUpperCase())
    console.log(randomWord)
  }, [])

  // Global keyboard event listener: dependencies in 2nd param
  useEffect(() => {
    if (!isGameOver) {
      window.addEventListener("keydown", handleKeyDown)
    }

    // else
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
    // Guess invalid (i.e. not in dictionary)
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
      }
      // Wrong guess
      else {
        // Run out of guesses: gameOver (loss)
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
      // Update colors
      updateTileStates()
      updateKeyStates()
    }
  }

  // Color logic: Three-pass algorithm
  function updateTileStates() {
    console.log(`activeRow: ${activeRow}`)
    console.log(gameBoard)
    let updatedGameBoard = [...gameBoard]

    // Create a copy of the solution as an array.
    // As we encounter letters that are included in the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]

    // 1: Identify corrects
    updatedGameBoard[activeRow].forEach((tile, tileIndex) => {
      if (tile.letter === copySolution[tileIndex]) {
        updatedGameBoard[activeRow][tileIndex] = { ...tile, state: "correct" }
        copySolution[tileIndex] = null
      }
    })

    // 2: Identify wrong position (yellows)
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

      const updatedGameBoard = gameBoard.map((row, rowIndex) =>
        rowIndex === activeRow
          ? row.map((cell, colIndex) =>
              colIndex === activeTile - 1 ? { ...cell, letter: "" } : cell
            )
          : row
      )
      console.log(updatedGameBoard)
      setGameBoard(updatedGameBoard)

      const userGuessString = userGuess.join("")
      const newGuess = userGuessString.slice(0, activeTile - 1)
      console.log(`user guess so far: ${newGuess}`)
      setUserGuess(newGuess)
    }
  }

  function handleLetter(letter) {
    if (activeTile < 5) {
      const newGuess = userGuess.concat(letter.toUpperCase())
      setUserGuess(newGuess)

      const updatedGameBoard = gameBoard.map((row, rowIndex) =>
        rowIndex === activeRow
          ? row.map((cell, colIndex) =>
              colIndex === activeTile ? { ...cell, letter: newGuess[activeTile] } : cell
            )
          : row
      )
      console.log(updatedGameBoard)
      setGameBoard(updatedGameBoard)

      setActiveTile((activeTile) => activeTile + 1)

      console.log(`user guess so far: ${newGuess}`)
      console.log(`activeTile changed from: ${activeTile} to ${activeTile + 1}`)
    }
  }

  function handleKeyDown(e) {
    const isLetterRegex = /^[a-zA-Z]$/

    if (e.key === "Enter") {
      handleEnter()
    } else if (e.key === "Backspace") {
      handleBackspace()
    } else if (isLetterRegex.test(e.key) === true) {
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

      {/* Game board */}
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <>
            <div className="guess">
              {row.map((cell, colIndex) => (
                <div className={getGuessTileClassName(rowIndex, colIndex)}>{cell.letter}</div>
              ))}
            </div>
          </>
        ))}
      </div>

      <Keyboard onClick={handleKeyboardClick} userGuess={userGuess} />
    </>
  )
}

export default App
