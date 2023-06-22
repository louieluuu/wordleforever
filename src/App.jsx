// TODO: package.json: changed from "module" to "type" = "commonjs" to support wordlist

import { useState, useEffect } from "react"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"
import GameBoard from "./components/GameBoard"

// Socket
import { socket } from "./socket"

// Confetti
import Confetti from "react-confetti"

function App() {
  const [isConfettiRunning, setIsConfettiRunning] = useState(false)

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

  // To be passed into the Keyboard. The logic for coloring Keyboard tiles
  // is slightly different from the coloring of game tiles.
  const [hints, setHints] = useState({ green: new Set(), yellow: new Set(), gray: new Set() })

  // For use in Challenge Mode
  const [isChallengeMode, setIsChallengeMode] = useState(false)

  // ! Socket states
  const [showForm, setShowForm] = useState(false)
  const [room, setRoom] = useState("")
  const [isInRoom, setIsInRoom] = useState(false)
  const [otherBoard, setOtherBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )

  // ! Socket useEffect
  // TODO: Passing in states to sockets seems to result in unreliable behaviour.
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("matchMade", (room) => {
      socket.emit("startNewGame", room)
    })

    socket.on("wordsGenerated", (room, solution, firstGuess) => {
      setIsInRoom(true)
      setIsGameOver(false)
      setRoom(room)
      setSolution(solution)
      setIsConfettiRunning(false)
      setHints({ green: new Set(), yellow: new Set(), gray: new Set() })
      const newGameBoard = [...gameBoard]
      // TODO: this colorize stuff should belong in the handleEnter instead of being specific
      // TODO: to the challengeMode case...
      const colorizedGuess = colorizeGuess(firstGuess, solution)
      newGameBoard[0] = colorizedGuess
      updateHints(colorizedGuess)
      setGameBoard(newGameBoard)
      setCurrentRow(1)
      socket.emit("wrongGuess", room, newGameBoard)
    })

    socket.on("showOtherBoard", (otherBoard) => {
      setOtherBoard(otherBoard)
    })

    // TODO: more cleanup
    return () => {
      socket.off("connect")
    }
  }, [])

  // TODO: Trying to move this to its own effect cause it depends on isGameOver
  // TODO: in other words not all the socket logic can belong under one umbrella
  useEffect(() => {
    socket.on("gameOver", (room) => {
      setIsGameOver(true)
      socket.emit("revealGameBoard", room, gameBoard)
    })

    socket.on("showFinalBoard", (finalBoard) => {
      setOtherBoard(finalBoard)
    })
  }, [gameBoard, isGameOver, otherBoard]) // TODO: .....................

  // Global keyboard event listener: dependencies in 2nd param
  // TODO: Needed to remove the 2nd param "[]" for this to work ?
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    setIsChallengeMode(true)

    // else
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

  /**
   *
   * HELPER FUNCTIONS
   *
   */

  // Checks if the userGuess adheres to the previous hints.
  function usesPreviousHints() {
    console.log("usesPreviousHints:")
    console.log(gameBoard)
    // No previous hints
    if (currentRow === 0) {
      return "yes"
    }

    const copyPreviousGuess = [...gameBoard[currentRow - 1]]
    const colorizedGuess = colorizeGuess(userGuess, solution)
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
  function colorizeGuess(guess, solution) {
    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]
    const colorizedGuess = [...guess]

    // 1: Identify greens
    guess.forEach((letter, letterIndex) => {
      if (letter === solution[letterIndex]) {
        colorizedGuess[letterIndex] = { letter: letter, color: "correct" }
        copySolution[letterIndex] = null
      }
    })

    // 2: Identify yellows
    guess.forEach((letter, letterIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (colorizedGuess[letterIndex].color !== "correct") {
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

    return colorizedGuess
  }

  function updateHints(colorizedGuess) {
    const newGreenHints = new Set(hints.green)
    const newYellowHints = new Set(hints.yellow)
    const newGrayHints = new Set(hints.gray)

    colorizedGuess.forEach((object) => {
      // TODO: Questionable if these extra conditions even need exist. Keyboard prioritizing
      // TODO: green makes it irrelevant whether the hints are represented accurately or not.

      // TODO: Also, investigate if this state can be just in Keyboard.
      if (object.color === "wrong-position") {
        if (!newGreenHints.has(object.letter)) {
          newYellowHints.add(object.letter)
        }
      }
      //
      else if (object.color === "correct") {
        newGreenHints.add(object.letter)
        if (newYellowHints.has(object.letter)) {
          newYellowHints.delete(object.letter)
        }
      }
      //
      else if (object.color === "wrong") {
        newGrayHints.add(object.letter)
      }
    })

    console.log(newGreenHints)
    console.log(newYellowHints)
    console.log(newGrayHints)

    const newHints = { green: newGreenHints, yellow: newYellowHints, gray: newGrayHints }
    setHints(newHints)
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
      const colorizedGuess = colorizeGuess(userGuess, solution)
      const newGameBoard = [...gameBoard]
      newGameBoard[currentRow] = colorizedGuess
      setGameBoard(newGameBoard)

      // Update hints to color the Keyboard keys
      updateHints(colorizedGuess)

      // Correct guess: Game Over (win)
      // Direct array comparison won't work with ===, so we must compare their string forms.
      if (userGuess.join("") === solution.join("")) {
        socket.emit("correctGuess", room)
        setIsConfettiRunning(true)
        setIsGameOver(true)
      }
      // Wrong guess
      else {
        // ! Socket
        socket.emit("wrongGuess", room, newGameBoard)
        // Run out of guesses: Game Over (loss)
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

  function handleNewGame() {
    setCurrentRow(0)
    setCurrentTile(0)
    setIsGameOver(false)
    setUserGuess(["", "", "", "", ""])
    setGameBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "" })))
    setOtherBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "" })))
    socket.emit("startNewGame", room)
  }

  // TODO: Move Keyboard events into Keyboard component
  // TODO: "Game" component that houses game logic?
  // TODO: Row and Tile components
  // TODO: Look into Context (stores) so props aren't so ugly
  return (
    <>
      {isConfettiRunning && (
        <Confetti numberOfPieces={150} initialVelocityY={-10} tweenDuration={3000} />
      )}

      <Header isChallengeMode={isChallengeMode} setIsChallengeMode={setIsChallengeMode} />

      {isInRoom ? (
        <>
          <GameBoard
            gameBoard={gameBoard}
            userGuess={userGuess}
            currentRow={currentRow}
            currentTile={currentTile}
            isGameOver={isGameOver}
          />

          {isGameOver && (
            <div className="menu">
              <button className="menu__btn" onClick={handleNewGame}>
                New Game
              </button>
            </div>
          )}

          <GameBoard
            gameBoard={otherBoard}
            userGuess={userGuess}
            currentRow={-1}
            currentTile={currentTile}
            isGameOver={isGameOver}
          />

          <Keyboard onClick={handleKeyboardClick} hints={hints} />
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
                <input autoFocus type="text" />
              </label>
            </form>
          )}
        </div>
      )}
    </>
  )
}

export default App
