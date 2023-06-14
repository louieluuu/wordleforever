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
  // TODO: Should solution be an array or a string?
  const [solution, setSolution] = useState([])
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )
  const [isGameOver, setIsGameOver] = useState(false)

  // For use in Challenge Mode
  const [isChallengeMode, setIsChallengeMode] = useState(false)
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

  // Helper functions
  function getGuessTileClassName(row, col) {
    let guessTileClassName = "guess__tile"

    if (!gameBoard[row][col].state) {
      if (row === activeRow && col < activeTile && !isGameOver) {
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

  function usesPreviousHints() {
    // Check green hints
    console.log(`fixedGreens:`)
    console.log(fixedGreens)

    for (let i = 0; i < userGuess.length; ++i) {
      if (fixedGreens[i] !== "" && userGuess[i] !== fixedGreens[i]) {
        return "green"
      }
    }

    // Check yellow hints
    for (const key in fixedYellows) {
      if (Object.hasOwnProperty.call(fixedYellows, key)) {
        let countLettersInGuess = userGuess.filter((letter) => letter === key).length
        if (fixedYellows[key] > countLettersInGuess) {
          return "yellow"
        }
      }
    }

    return "okay"
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
    // ! Challenge mode: adhere to previous hints
    else if (isChallengeMode && usesPreviousHints() !== "okay") {
      console.log(`Not adherent to: ${usesPreviousHints()}`)
    }
    // Submit guess
    else {
      // Update the game board's letters and colors
      const updatedGameBoard = [...gameBoard]
      updatedGameBoard[activeRow] = updatedGameBoard[activeRow].map((object, objectIndex) => ({
        ...object,
        letter: userGuess[objectIndex],
      }))

      const coloredGameBoard = updateTileStates(updatedGameBoard)
      console.log(coloredGameBoard)

      setGameBoard(coloredGameBoard)

      // ! Challenge Mode: update relevant states the player must adhere to
      const newFixedGreens = [...fixedGreens]
      const newFixedYellows = { ...fixedYellows }
      coloredGameBoard[activeRow].forEach((object, objectIndex) => {
        if (object.state === "correct") {
          newFixedGreens[objectIndex] = object.letter
          // Remove yellows from fixedYellows as they become green
          if (object.letter in newFixedYellows) {
            newFixedYellows[object.letter] -= 1
            // Cleanup the hashmap when values reach 0
            if (newFixedYellows[object.letter] === 0) {
              delete newFixedYellows[object.letter]
            }
          }
        }
        //
        else if (object.state === "wrong-position") {
          // TODO: I don't know if this logic is supposed to be *that* hard...........
          let countLettersInGuess = userGuess.filter((letter) => letter === object.letter).length
          let countLettersInHashmap = newFixedYellows[object.letter]
          let countLettersInSolution = solution.filter((letter) => letter === object.letter).length

          if (countLettersInGuess <= countLettersInHashmap) {
            // do nothing
          }
          //
          else {
            if (countLettersInGuess > countLettersInSolution) {
              // do nothing
            } else {
              // increment if all conditions are met
              if (object.letter in newFixedYellows) {
                newFixedYellows[object.letter] += 1
              }
              //
              else {
                newFixedYellows[object.letter] = 1
              }
            }
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
      } else if (clicked === "Backspace") {
        handleBackspace()
      } else {
        handleLetter(clicked)
      }
    }
  }

  return (
    <>
      <Header isChallengeMode={isChallengeMode} setIsChallengeMode={setIsChallengeMode} />

      {/* Game Board */}
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="guess">
            {rowIndex === activeRow
              ? userGuess.map((letter, index) => (
                  // <div key={index} className={`guess__tile${index < activeTile ? "--active" : ""}`}>
                  <div key={index} className={getGuessTileClassName(rowIndex, index)}>
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
