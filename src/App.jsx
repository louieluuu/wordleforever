// TODO: package.json: changed from "module" to "type" = "commonjs" to support wordlist

import { useState, useEffect } from "react"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

// Socket
import { socket } from "./socket"

function App() {
  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  // userGuess and solution are arrays instead of strings because arrays are
  // easier to manipulate in most cases (ex. to find occurrence of a char).
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])

  // gameBoard is not populated with strings. It's comprised of Objects with a Letter property,
  // and, as required, a Color property.
  // The colors cannot be determined all at once; the coloring algorithm takes three passes.
  // Thus, the color information has to be stored in a buffer somewhere.
  // That's why we use an Object: the color property will be stored in the Object on demand.
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )

  // For use in Challenge Mode
  const [isChallengeMode, setIsChallengeMode] = useState(false)
  const [greenHints, setGreenHints] = useState(["", "", "", "", ""])
  // If a user unearths 2 E's as yellow hints, he must include at least 2 E's in subsequent answers.
  // yellowHints is a hashmap that records yellow hints and their occurrence freq., ex. {E: 2}.
  const [yellowHints, setYellowHints] = useState({})

  // ! Socket states
  const [showForm, setShowForm] = useState(false)
  const [room, setRoom] = useState("")
  const [isInRoom, setIsInRoom] = useState(false)
  const [otherBoard, setOtherBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )

  // ! Socket useEffect
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("matchMade", (room, solution) => {
      setRoom(room)
      setSolution(solution)
      setIsInRoom(true)
    })

    socket.on("revealBoard", (hiddenBoard) => {
      setOtherBoard(hiddenBoard)
    })

    // TODO: more cleanup?
    return () => {
      socket.off("connect")
    }
  }, [])

  // Global keyboard event listener: dependencies in 2nd param
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    setIsChallengeMode(true)

    // else
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentTile, isInRoom])

  /**
   *
   * HELPER FUNCTIONS
   *
   */
  function getGuessTileClassName(gameBoard, row, col) {
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
    console.log("usesPreviousHints:")
    console.log(gameBoard)
    // No previous hints
    if (currentRow === 0) {
      return "yes"
    }

    const copyPreviousGuess = [...gameBoard[currentRow - 1]]
    const colorizedGuess = colorizeGuess(userGuess)
    console.log("colorizedGuess:")
    console.log(colorizedGuess)

    for (let i = 0; i < copyPreviousGuess.length; ++i) {
      if (copyPreviousGuess[i].color === "correct") {
        if (colorizedGuess[i].letter !== copyPreviousGuess[i].letter) {
          return "green"
        }
      }
      //
      else if (copyPreviousGuess[i].color === "wrong-position") {
        const index = colorizedGuess.findIndex((obj) => obj.letter === copyPreviousGuess[i].letter)
        if (index === -1) {
          return "yellow"
        }
        copyPreviousGuess[i] = null
        colorizedGuess[index].letter = null
      }
    }

    for (let i = 0; i < copyPreviousGuess.length; ++i) {
      if (copyPreviousGuess[i] !== null) {
        if (copyPreviousGuess[i].color === "wrong-position") {
          return "yellow"
        }
      }
    }

    return "yes"
  }

  // Three-pass algorithm evaluates the userGuess and assigns colors accordingly.
  function colorizeGuess(guess) {
    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]
    let colorizedGuess = new Array(5).fill().map(() => ({}))

    console.log("Very first time")
    console.log(colorizedGuess)

    // 1: Identify greens
    guess.forEach((letter, letterIndex) => {
      if (letter === solution[letterIndex]) {
        colorizedGuess[letterIndex] = { letter: letter, color: "correct" }
        copySolution[letterIndex] = null
      }
    })

    console.log("After green stage:")
    console.log(colorizedGuess)

    // 2: Identify yellows
    guess.forEach((letter, letterIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (colorizedGuess[letterIndex] !== "correct") {
        let includedIndex = copySolution.indexOf(letter)
        if (includedIndex !== -1) {
          colorizedGuess[letterIndex] = { letter: letter, color: "wrong-position" }
          copySolution[includedIndex] = null
        }
      }
    })

    // 3: Any remaining tiles must be wrong
    colorizedGuess.forEach((object, objectIndex) => {
      if (!object.color) {
        colorizedGuess[objectIndex] = { letter: guess[objectIndex], color: "wrong" }
      }
    })

    console.log("Fresh out the oven")
    console.log(colorizedGuess)
    return colorizedGuess
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
    else if (isChallengeMode && usesPreviousHints() !== "yes") {
      console.log(`Not adherent to: ${usesPreviousHints()}`)
    }
    // Guess is valid: submit guess
    else {
      // Update the gameBoard with the colorized guess
      const colorizedGuess = colorizeGuess(userGuess)
      const newGameBoard = [...gameBoard]
      newGameBoard[currentRow] = colorizedGuess
      setGameBoard(newGameBoard)

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

      // ! Socket
      socket.emit("guessSubmit", room, newGameBoard)
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

  function handleKeyDown(e) {
    // TODO: Generalize these two handleKey functions using the comments below
    // const variable = e.key
    // handleKeyboardClick(e.key)

    const isLetterRegex = /^[a-zA-Z]$/

    if (isGameOver || !isInRoom) {
      return
    }

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

  function createRoom() {
    socket.emit("createRoom")
    socket.on("returnUuid", (room) => {
      console.log(`copy & paste this code to your friend: ${room}`)
    })
  }

  function joinRoom(e) {
    e.preventDefault()
    const pastedValue = e.clipboardData.getData("text/plain")
    socket.emit("joinRoom", pastedValue)

    socket.on("roomError", (room) => {
      console.log(`Error: Room "${room}" doesn't exist.`)
    })
  }

  // TODO: Move Keyboard events into Keyboard component
  // TODO: "Game" component that houses game logic?
  // TODO: Row and Tile components
  // TODO: Look into Context (stores) so props aren't so ugly
  return (
    <>
      <Header isChallengeMode={isChallengeMode} setIsChallengeMode={setIsChallengeMode} />

      {isInRoom ? (
        <>
          <div className="game-board">
            {gameBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="guess">
                {rowIndex === currentRow
                  ? userGuess.map((letter, index) => (
                      <div
                        key={index}
                        className={getGuessTileClassName(gameBoard, rowIndex, index)}>
                        {letter}
                      </div>
                    ))
                  : row.map((tile, tileIndex) => (
                      <div
                        key={tileIndex}
                        className={getGuessTileClassName(gameBoard, rowIndex, tileIndex)}>
                        {tile.letter}
                      </div>
                    ))}
              </div>
            ))}
          </div>

          <div className="game-board">
            {otherBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="guess">
                {row.map((tile, tileIndex) => (
                  <div
                    key={tileIndex}
                    className={getGuessTileClassName(otherBoard, rowIndex, tileIndex)}>
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
      ) : (
        <div className="menu">
          <button className="menu__btn" onClick={createRoom}>
            Create
          </button>
          <button className="menu__btn" onClick={() => setShowForm((prev) => !prev)}>
            Join
          </button>

          {showForm && (
            <form onPaste={joinRoom}>
              <label>
                Enter your code here: {""}
                <input autoFocus type="text" onChange={(e) => setRoom(e.target.value)} />
              </label>
            </form>
          )}
        </div>
      )}
    </>
  )
}

export default App
