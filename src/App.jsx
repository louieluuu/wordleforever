import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

function App() {
  const [activeTile, setActiveTile] = useState(0)
  const [activeRow, setActiveRow] = useState(0)
  // userGuess is an array instead of a string because an array is more convenient
  // to manipulate, ultimately to display in JSX/HTML.
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )
  const [isGameOver, setIsGameOver] = useState(false)

  // For use in Challenge Mode
  const [fixedGreens, setFixedGreens] = useState(["", "", "", "", ""])
  const [fixedYellows, setFixedYellows] = useState({}) // hashmap

  // Select random word upon mount
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase()
    setSolution(randomWord.split(""))
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

    // TODO: Can I bundle this logic together with the colors?
    // if (!gameBoard[row][col].state) {
    //   if (activeRow === row && col < userGuess.length && !isGameOver) {
    //     guessTileClassName += "--active"
    //   }
    // }
    //
    if (gameBoard[row][col].state === "correct") {
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

  function usesPreviousHints() {
    // Check green hints
    console.log(`userGuess: ${userGuess}`)

    for (let objectIndex = 0; objectIndex < userGuess.length; objectIndex++) {
      if (
        fixedGreens[objectIndex].letter &&
        userGuess[objectIndex].letter !== fixedGreens[objectIndex].letter
      ) {
        return false
      }
    }

    // // Check yellow hints; count of letters must be the same
    // let countInFixedYellows = 0
    // let countInUserGuess = 0

    return true
  }

  function handleEnter() {
    // Guess too short
    if (activeTile < 5) {
      console.log(`activeRow: ${activeRow}`)
      console.log(`Not enough letters in: ${userGuess}`)
    }
    // Guess invalid
    else if (!VALID_GUESSES.includes(userGuess.join("").toLowerCase())) {
      console.log(`Guess not in dictionary: ${userGuess}`)
    }
    // // ! Challenge mode: adhere to previous hints
    // else if (usesPreviousHints() === false) {
    //   console.log(`Challenge mode: guess must adhere to previous hints`)
    // }
    // Submit guess
    else {
      // Update & color game board
      const updatedGameBoard = [...gameBoard]
      updatedGameBoard[activeRow] = updatedGameBoard[activeRow].map((object, objectIndex) => ({
        ...object,
        letter: userGuess[objectIndex],
      }))

      const coloredGameBoard = updateTileStates(updatedGameBoard)
      console.log(coloredGameBoard)

      setGameBoard(coloredGameBoard)

      // Update Keyboard keys

      // ! Challenge Mode: update relevant states the player must adhere to
      const newFixedGreens = [...fixedGreens]
      const newFixedYellows = { ...fixedYellows }
      coloredGameBoard[activeRow].forEach((object, objectIndex) => {
        if (object.state === "correct") {
          newFixedGreens[objectIndex] = coloredGameBoard[activeRow][objectIndex]
        }
        //
        else if (object.state === "wrong-position") {
          if (newFixedYellows[object.letter] in newFixedYellows) {
            newFixedYellows[object.letter] += 1
          } else {
            newFixedYellows[object.letter] = 1
          }
        }
        console.log(newFixedGreens)
        console.log(newFixedYellows)
      })
      setFixedGreens(newFixedGreens)
      setFixedYellows(newFixedYellows)

      // Correct guess: gameOver (win)
      // Direct array comparison won't work with ===, so we must compare their string forms.
      if (userGuess.join("") === solution.join("")) {
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
      }
      // Game continues: note that these states will be changed regardless
      // of whether the game is over or not. This allows the winning row
      // to be properly rendered as well.
      setActiveRow((activeRow) => activeRow + 1)
      setActiveTile(0)
      setUserGuess(["", "", "", "", ""])
      console.log(`Valid guess submitted: ${userGuess}`)
      console.log(`activeRow: ${activeRow}`)
      console.log(`activeTile: ${activeTile}`)
    }
  }

  // Color logic: Three-pass algorithm
  function updateTileStates(updatedGameBoard) {
    console.log(`activeRow: ${activeRow}`)
    console.log(gameBoard)

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

    return updatedGameBoard
  }

  function handleBackspace() {
    if (activeTile !== 0) {
      setActiveTile((activeTile) => activeTile - 1)

      const newGuess = [...userGuess]
      newGuess[activeTile - 1] = ""
      console.log(`user guess so far: ${newGuess}`)
      setUserGuess(newGuess)

      console.log(`activeTile changed from: ${activeTile} to ${activeTile - 1}`)
    }
  }

  function handleLetter(letter) {
    if (activeTile < 5) {
      const newGuess = [...userGuess]
      newGuess[activeTile] = letter.toUpperCase()
      setUserGuess(newGuess)

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
    if (!isGameOver) {
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
  }

  return (
    <>
      <Header />

      {/* Game Board */}
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="guess">
            {rowIndex === activeRow
              ? userGuess.map((letter, index) => (
                  <div key={index} className={`guess__tile${index < activeTile ? "--active" : ""}`}>
                    {letter}
                  </div>
                ))
              : row.map((tile, tileIndex) => (
                  <div key={tileIndex} className={getGuessTileClassName(rowIndex, tileIndex)}>
                    {tile.letter}
                  </div>
                ))}
          </div>
        ))}
      </div>

      <Keyboard
        onClick={handleKeyboardClick}
        gameBoard={gameBoard}
        greens={fixedGreens}
        yellows={fixedYellows}
      />
    </>
  )
}

export default App
