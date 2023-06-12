import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

function App() {
  const [activeTile, setActiveTile] = useState(0)
  const [activeRow, setActiveRow] = useState(0)
  const [userGuess, setUserGuess] = useState("     ")
  const [targetWord, setTargetWord] = useState("")
  const [gameBoard, setGameBoard] = useState(new Array(6).fill().map((_) => new Array(5).fill("")))
  const [isGameOver, setIsGameOver] = useState(false)
  // const [gridLetter, setGridLetter] = useState("")

  // Game setup on mount
  // -select random word
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord.toUpperCase())
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

    if (activeRow === row && col < userGuess.length) {
      guessTileClassName += "--active"
    }

    // TODO: erase later, only for visualization
    if (activeRow === row && col === activeTile) {
      guessTileClassName += "--current"
    }

    return guessTileClassName
  }

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
            `Correct guess: guess: ${userGuess} vs. target: ${targetWord} \n
            You win !! Yay!`
          )
          setIsGameOver(true)
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
            console.log(`activeRow: ${activeRow}`)
            console.log(`activeTile: ${activeTile}`)
          }
        }
      }
    }

    // Backspace
    else if (e.key === "Backspace") {
      if (activeTile !== 0) {
        setActiveTile((activeTile) => activeTile - 1)

        const updatedGameBoard = gameBoard.map((row, rowIndex) =>
          rowIndex === activeRow
            ? row.map((cell, colIndex) => (colIndex === activeTile - 1 ? "" : cell))
            : row
        )
        console.log(updatedGameBoard)
        setGameBoard(updatedGameBoard)

        const newGuess = userGuess.slice(0, activeTile - 1)
        console.log(`user guess so far: ${newGuess}`)
        setUserGuess(newGuess)

        console.log(`activeTile changed from: ${activeTile} to ${activeTile - 1}`)
        console.log(`key pressed: ${e.key}`)
      }
    }

    // Letters
    else if (isLetterRegex.test(e.key) === true) {
      if (activeTile < 5) {
        const newGuess = userGuess.concat(e.key.toUpperCase())
        setUserGuess(newGuess)

        const updatedGameBoard = gameBoard.map((row, rowIndex) =>
          rowIndex === activeRow
            ? row.map((cell, colIndex) => (colIndex === activeTile ? newGuess[activeTile] : cell))
            : [...row]
        )
        console.log(updatedGameBoard)
        setGameBoard(updatedGameBoard)

        setActiveTile((activeTile) => activeTile + 1)

        console.log(`user guess so far: ${newGuess}`)
        console.log(`activeTile changed from: ${activeTile} to ${activeTile + 1}`)
        console.log(`key pressed: ${e.key}`)
      }
    }
  }

  // TODO: getStyles() generalize

  function onKeyboardClick(letter) {
    const newGuess = userGuess.concat(letter.toUpperCase())
    setUserGuess(newGuess)
  }

  return (
    <>
      <Header />

      {/* Game Board */}
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <>
            {rowIndex === activeRow ? (
              Array.from(userGuess).map((letter) => <div className="guess__tile">{letter}</div>)
            ) : (
              // <div>{userGuess}</div>
              <div className="guess">
                {row.map((tile, tileIndex) => (
                  <div className={getGuessTileClassName(rowIndex, tileIndex)}>{tile}</div>
                ))}
              </div>
            )}
          </>
        ))}
      </div>

      <Keyboard onClick={onKeyboardClick} />
    </>
  )
}

export default App
