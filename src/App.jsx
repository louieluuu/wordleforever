import { useState, useEffect } from "react"
import { WORD_LIST } from "./data/wordList.js"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

function App() {
  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)
  // userGuess and solution are arrays instead of strings because arrays are
  // easier to manipulate in most cases (ex. to find occurrence of a char).
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])
  // gameBoard is not populated with strings. It's comprised of Objects with a Letter property.
  // Later on, in order to color each tile, the color information has to be stored in a buffer.
  // That's why we choose an Object: the color property will be added to the Object on demand.
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )
  const [isGameOver, setIsGameOver] = useState(false)

  // For use in Challenge Mode
  const [isChallengeMode, setIsChallengeMode] = useState(false)
  const [greenHints, setGreenHints] = useState(["", "", "", "", ""])
  // If a user unearths 2 E's as yellow hints, he must include 2 E's in subsequent answers.
  // yellowHints is a hashmap that records yellow hints and their occurrence freq., ex. {E: 2}.
  const [yellowHints, setYellowHints] = useState({})

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
  }, [currentTile, isGameOver])

  /**
   *
   * HELPER FUNCTIONS
   *
   */
  function getGuessTileClassName(row, col) {
    let guessTileClassName = "guess__tile"

    if (!gameBoard[row][col].color) {
      if (row === currentRow && col < currentTile && !isGameOver) {
        guessTileClassName += "--active"
      }
    }
    //
    else if (gameBoard[row][col].color === "correct") {
      guessTileClassName += "--correct"
    }
    //
    else if (gameBoard[row][col].color === "wrong-position") {
      guessTileClassName += "--wrong-position"
    }
    //
    else if (gameBoard[row][col].color === "wrong") {
      guessTileClassName += "--wrong"
    }

    return guessTileClassName
  }

  // Checks if the userGuess adheres to the previous hints.
  function usesPreviousHints() {
    // Using traditional for loops here because forEach doesn't terminate upon return.
    console.log(greenHints)

    // Check adherence to green hints first
    for (let i = 0; i < userGuess.length; ++i) {
      if (greenHints[i] !== "" && userGuess[i] !== greenHints[i]) {
        return "green"
      }
    }

    // Then yellow hints.
    // Note the condition: if yellowHints is {E: 2}, the userGuess can have 3 E's, but not 1.
    for (const key in yellowHints) {
      const countLettersInGuess = userGuess.filter((letter) => letter === key).length
      if (yellowHints[key] > countLettersInGuess) {
        return "yellow"
      }
    }

    return "okay"
  }

  // Three-pass algorithm that assigns colors based on the correctness of the userGuess and
  // transfers that information to the gameBoard.
  function updateTileColors(newGameBoard) {
    console.log(`currentRow: ${currentRow}`)
    console.log(gameBoard)

    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]

    // 1: Identify greens
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      if (tile.letter === copySolution[tileIndex]) {
        newGameBoard[currentRow][tileIndex] = { ...tile, color: "correct" }
        copySolution[tileIndex] = null
      }
    })

    // 2: Identify yellows
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (!tile.color) {
        let includedIndex = copySolution.indexOf(tile.letter)
        if (includedIndex !== -1) {
          newGameBoard[currentRow][tileIndex] = { ...tile, color: "wrong-position" }
          copySolution[includedIndex] = null
        }
      }
    })

    // 3: Any remaining tiles must be wrong
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      if (!tile.color) {
        newGameBoard[currentRow][tileIndex] = { ...tile, color: "wrong" }
      }
    })

    return newGameBoard
  }

  function handleEnter() {
    // Guess is too short
    if (currentTile < 5) {
      console.log(`currentRow: ${currentRow}`)
      console.log(`Not enough letters in: ${userGuess}`)
    }
    // Guess is invalid (i.e. doesn't appear in dictionary)
    else if (!VALID_GUESSES.includes(userGuess.join("").toLowerCase())) {
      console.log(`Guess not in dictionary: ${userGuess}`)
    }
    // ! Challenge Mode: guess doesn't adhere to previous hints
    else if (isChallengeMode && usesPreviousHints() !== "okay") {
      console.log(`Not adherent to: ${usesPreviousHints()}`)
    }
    // Guess is valid: submit guess
    else {
      // Update the gameBoard's letters and colors
      const newGameBoard = [...gameBoard]
      newGameBoard[currentRow] = newGameBoard[currentRow].map((object, objectIndex) => ({
        ...object,
        letter: userGuess[objectIndex],
      }))

      const coloredGameBoard = updateTileColors(newGameBoard)
      setGameBoard(coloredGameBoard)

      // ! Challenge Mode: update the hints the player must adhere to
      const newGreenHints = [...greenHints]
      const newYellowHints = { ...yellowHints }

      // Update green hints first
      coloredGameBoard[currentRow].forEach((object, objectIndex) => {
        if (object.color === "correct") {
          newGreenHints[objectIndex] = object.letter
          // Decrement yellow hints as they become green
          if (object.letter in newYellowHints) {
            newYellowHints[object.letter] -= 1
            // Cleanup the hashmap when values reach 0
            if (newYellowHints[object.letter] === 0) {
              delete newYellowHints[object.letter]
            }
          }
        }

        // Then yellow hints. The logic is hard to parse without examples.
        // Follow along, keeping in mind that the key property is the # of letters.
        /* 
        -- CASE 1 --
        guess: BROKE  |  yellowHints: {O: 1}  |  solution: IGLOO

        yellowHints should NOT increment, even though there is an "O"
        in BROKE that is in the wrong-position. This is because a yellow "O" has
        already been recorded by the hashmap; there is no need to duplicate it.
        In other words, the # O's in yellowHints acts as a "min".

        -- CASE 2 --
        guess: OOZES  |  yellowHints: {O: 1}  |  solution: GLOWS

        yellowHints should NOT increment, even though there are two "O"s
        in OOZES that are in the wrong-position. This is because there is only one
        "O" in the solution. In other words, the # O's in the solution acts as a "max".

        */
        else if (object.color === "wrong-position") {
          let countLettersInGuess = userGuess.filter((letter) => letter === object.letter).length
          let countLettersInYellowHints = newYellowHints[object.letter]
          let countLettersInSolution = solution.filter((letter) => letter === object.letter).length

          if (countLettersInGuess <= countLettersInYellowHints) {
            // do nothing; does not meet min threshold
          }
          //
          else {
            if (countLettersInGuess > countLettersInSolution) {
              // do nothing; exceeds max threshold
            }
            //
            else {
              // Increment if the count is in between the min and max thresholds
              if (object.letter in newYellowHints) {
                newYellowHints[object.letter] += 1
              }
              //
              else {
                newYellowHints[object.letter] = 1
              }
            }
          }
        }
        console.log(newGreenHints)
        console.log(newYellowHints)
      })
      setGreenHints(newGreenHints)
      setYellowHints(newYellowHints)

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
        if (currentRow >= 5) {
          console.log(`game over, run out of guesses`)
          setIsGameOver(true)
        }
      }
      // Game continues: note that these states will be changed regardless of whether
      // the game is over or not. This allows the winning row to be properly rendered as well.
      setCurrentRow((currentRow) => currentRow + 1)
      setCurrentTile(0)
      setUserGuess(["", "", "", "", ""])
      console.log(`Valid guess submitted: ${userGuess}`)
      console.log(`currentRow: ${currentRow}`)
      console.log(`currentTile: ${currentTile}`)
    }
  }

  function handleBackspace() {
    if (currentTile !== 0) {
      setCurrentTile((currentTile) => currentTile - 1)

      const newGuess = [...userGuess]
      newGuess[currentTile - 1] = ""
      console.log(`user guess so far: ${newGuess}`)
      setUserGuess(newGuess)
    }
  }

  function handleLetter(letter) {
    if (currentTile < 5) {
      const newGuess = [...userGuess]
      newGuess[currentTile] = letter.toUpperCase()
      setUserGuess(newGuess)

      setCurrentTile((currentTile) => currentTile + 1)

      console.log(`user guess so far: ${newGuess}`)
      console.log(`currentTile changed from: ${currentTile} to ${currentTile + 1}`)
    }
  }

  // TODO: Is there a way to generalize these two handleKey functions?
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

  // TODO: Am I passing in these props correctly?
  return (
    <>
      <Header isChallengeMode={isChallengeMode} setIsChallengeMode={setIsChallengeMode} />

      {/* Game Board */}
      <div className="game-board">
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="guess">
            {rowIndex === currentRow
              ? userGuess.map((letter, index) => (
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
        greenHints={greenHints}
        yellowHints={yellowHints}
      />
    </>
  )
}

export default App
