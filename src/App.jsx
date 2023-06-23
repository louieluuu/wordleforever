// TODO: package.json: changed from "module" to "type" = "commonjs" to support wordlist

import { useState, useEffect } from "react"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"
import GameBoard from "./components/GameBoard"
import MenuModal from "./components/MenuModal"
import CountdownTimer from "./components/CountdownTimer"

// Socket
import { socket } from "./socket"

// Confetti
import Confetti from "react-confetti"

function App() {
  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)

  // userGuess and solution are arrays instead of strings because arrays are
  // more useful in many cases, ex. to render via .map().
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])

  // Updates upon every submitted guess, not every key stroke. In this way, the gameBoard
  // represents the "history" of the game.
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" }))
  )

  const [hints, setHints] = useState({})

  const [isGameOver, setIsGameOver] = useState(false)
  const [isOutOfGuesses, setIsOutOfGuesses] = useState(false)
  const [isChallengeMode, setIsChallengeMode] = useState(false)
  const [isConfettiRunning, setIsConfettiRunning] = useState(false)

  // ! Socket states
  const [room, setRoom] = useState("")
  const [isInGame, setIsInGame] = useState(false)
  const [otherBoards, setOtherBoards] = useState([])

  // ! Socket useEffect
  // TODO: Passing in states to sockets seems to result in unreliable behaviour.
  useEffect(() => {
    function resetStates() {
      setCurrentRow(0)
      setCurrentTile(0)
      setUserGuess(["", "", "", "", ""])
      setIsOutOfGuesses(false)
      setIsGameOver(false)
      setGameBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })))
      setOtherBoards([])
      setIsInGame(true)
      setIsConfettiRunning(false)
      setHints({ green: new Set(), yellow: new Set(), gray: new Set() })
    }

    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("matchMade", (roomId) => {
      socket.emit("startNewGame", roomId)
    })

    socket.on("gameStarted", (roomId, allGameBoards, solution, firstGuess) => {
      resetStates()

      setRoom(roomId)
      setSolution(solution)

      // Filter out the socket's own gameBoard.
      const otherBoards = allGameBoards.filter((object) => object.socketId !== socket.id)
      setOtherBoards(otherBoards)

      // ! Challenge Mode specific
      // const newGameBoard = [...gameBoard]
      // // TODO: this colorize stuff should belong in the handleEnter instead of being specific
      // // TODO: to the challengeMode case...
      // const colorizedGuess = colorizeGuess(firstGuess, solution)
      // newGameBoard[0] = colorizedGuess
      // updateHints(colorizedGuess)
      // setGameBoard(newGameBoard)
      // setCurrentRow(1)
      // socket.emit("wrongGuess", socket.id, roomId, newGameBoard)
    })

    // TODO: more cleanup
    return () => {
      socket.off("connect")
    }
  }, [])

  // TODO: Tested, has to belong in its own realm. :)
  useEffect(() => {
    socket.on("otherBoardUpdated", (socketId, otherBoard) => {
      const newOtherBoards = [...otherBoards]

      newOtherBoards.forEach((object) => {
        if (object.socketId === socketId) {
          object.gameBoard = otherBoard
        }
      })

      setOtherBoards(newOtherBoards)
    })
  }, [otherBoards])

  // TODO: Trying to move this to its own effect cause it depends on isGameOver
  // TODO: in other words not all the socket logic can belong under one umbrella
  useEffect(() => {
    socket.on("gameOver", (room) => {
      setIsGameOver(true)
      socket.emit("revealGameBoard", room, gameBoard)
    })

    socket.on("gameBoardBroadcasted", (socketId, finalBoard) => {
      const newOtherBoards = [...otherBoards]

      newOtherBoards.forEach((object) => {
        if (object.socketId === socketId) {
          object.gameBoard = finalBoard
        }
      })
      setOtherBoards(newOtherBoards)
    })
  }, [gameBoard, isGameOver, otherBoards]) // TODO: .....................

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

  // Three-pass algorithm that evaluates the userGuess and assigns colors accordingly.
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
      if (object.color === "correct") {
        newGreenHints.add(object.letter)
      }
      //
      else if (object.color === "wrong-position") {
        newYellowHints.add(object.letter)
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
        socket.emit("wrongGuess", socket.id, room, newGameBoard)
        // Run out of guesses: Game Over (loss)
        if (currentRow >= 5) {
          console.log(`game over, run out of guesses`)
          setIsOutOfGuesses(true)
          socket.emit("outOfGuesses", room)
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

  function handleNewGame() {
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

      <Header />

      {isInGame ? (
        <>
          <CountdownTimer isInGame={isInGame} />

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

          {otherBoards.map((object) => (
            <GameBoard
              gameBoard={object.gameBoard}
              userGuess={userGuess}
              currentRow={-1}
              currentTile={currentTile}
              isGameOver={isGameOver}
            />
          ))}

          <Keyboard
            hints={hints}
            isOutOfGuesses={isOutOfGuesses}
            isGameOver={isGameOver}
            isInGame={isInGame}
            handleLetter={handleLetter}
            handleEnter={handleEnter}
            handleBackspace={handleBackspace}
          />
        </>
      ) : (
        <MenuModal />
      )}
    </>
  )
}

export default App
