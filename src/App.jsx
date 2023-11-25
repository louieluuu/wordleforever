import { useState } from "react"

// Data
import VALID_WORDS from "./data/validWords"
import WORDLE_ANSWERS from "./data/wordleAnswers"

// Components
import NavBar from "./components/NavBar"
import Menu from "./components/Menu"
import GameBoard from "./components/GameBoard"
import Keyboard from "./components/Keyboard"
import AlertModal from "./components/AlertModal"

function App() {

  // Game mode states
  const [gameMode, setGameMode] = useState(null)
  const [connectionMode, setConnectionMode] = useState(null)

  // Gameflow states
  const [isGameActive, setIsGameActive] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  const [isOutOfGuesses, setIsOutOfGuesses] = useState(false)

  // Gameplay states
  const [board, setBoard] = useState(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" })))
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [activeCellIndex, setActiveCellIndex] = useState(0)
  const [submittedGuesses, setSubmittedGuesses] = useState([])
  const [hints, setHints] = useState({ green: new Set(), yellow: new Set(), grey: new Set() })

  // Alert states
  const [alertMessage, setAlertMessage] = useState(".")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Solution
  const [solution, setSolution] = useState("")


  // Helper functions

  function resetStates() {
    setIsGameActive(true)
    setIsGameWon(false)
    setIsOutOfGuesses(false)
    setBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" })))
    setActiveRowIndex(0)
    setActiveCellIndex(0)
    setSubmittedGuesses([])
    setHints({ green: new Set(), yellow: new Set(), grey: new Set() })
    setShowAlertModal(false)
    generateSolution()
  }

  function handleKeyPress(e) {
    if (e.match(/^[a-zA-Z]$/)) {
      handleLetter(e)
    } else if (e === 'Backspace') {
      handleBackspace()
    } else if (e === 'Enter') {
      handleEnter()
    }
  }

  function handleLetter(e) {
    if (activeRowIndex < board.length) {
      const updatedBoard = board.map((row, rowIndex) => {
        if (rowIndex === activeRowIndex) {
          return row.map((cell, cellIndex) => {
            if (cellIndex === activeCellIndex && board[activeRowIndex][activeCellIndex].letter === '') {
              return { ...cell, letter: e.toUpperCase() }
            } else {
              return cell
            }
          });
        } else {
          return row
        }
      });

      if (activeCellIndex === updatedBoard[activeRowIndex].length) {
        return
      }
      
      setBoard(updatedBoard)
      setActiveCellIndex(activeCellIndex + 1)
    }
  }

  function handleBackspace() {
    const updatedBoard = [...board]
    if (activeCellIndex === updatedBoard[activeRowIndex].length - 1 && updatedBoard[activeRowIndex][activeCellIndex].letter !== '') {
      updatedBoard[activeRowIndex][activeCellIndex] = { ...updatedBoard[activeRowIndex][activeCellIndex], letter: '' }
      setBoard(updatedBoard)
    }
    else if (activeCellIndex > 0) {
      updatedBoard[activeRowIndex][activeCellIndex - 1] = { ...updatedBoard[activeRowIndex][activeCellIndex - 1], letter: '' }
      setActiveCellIndex(activeCellIndex - 1)
      setBoard(updatedBoard)
    }
  }

  function handleEnter() {
    const enteredWord = board[activeRowIndex]
      .filter(cell => cell.letter !== '')
      .map(cell => cell.letter)
      .join('')
      .toUpperCase()

    if (enteredWord.length === 5) {

      if (enteredWord === solution) {
        setIsGameWon(true)
      }
      else if (VALID_WORDS.includes(enteredWord.toLowerCase())) {
        setSubmittedGuesses([...submittedGuesses, activeRowIndex])
        const nextRow = activeRowIndex + 1
        setActiveRowIndex(nextRow)
        setActiveCellIndex(0)
        if (nextRow >= board.length) {
          setIsOutOfGuesses(true)
        }
      } else {
        setAlertMessage("Not in word list")
        setShowAlertModal(true)
        return
      }
    } else {
      setAlertMessage("Not enough letters")
      setShowAlertModal(true)
      return
    }

    const colorizedGuess = assignColors(enteredWord, solution)
    const updatedBoard = board.map(row => [...row])
    updatedBoard[activeRowIndex] = colorizedGuess
    setBoard(updatedBoard)

    updateHints(colorizedGuess)
  }

  function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    setSolution(newSolution)
    console.log("solution is", newSolution)
  }

  function startNewGame() {
    resetStates()
    setIsGameActive(true)
    console.log("Starting game with", gameMode, connectionMode)
  }

  

  function assignColors(guess, solution) {
    let colorizedGuess = new Array(5).fill({ letter: "", color: "" })
    let solutionArray = [...solution]

    // Assign greens (correct letter in correct spot)
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      if (letter === solution[i]) {
        colorizedGuess[i] = { letter: letter, color: "green" }
        solutionArray[i] = null
      }
    }

    // Assign yellows (correct letter in wrong spot)
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      // Don't overwrite already assigned greens
      if (colorizedGuess[i].color !== "green") {
        let includedIndex = solutionArray.indexOf(letter)
        if (includedIndex !== -1) {
          colorizedGuess[i] = { letter: letter, color: "yellow" }
          solutionArray[includedIndex] = null
        }
      }
    }

    // Assign greys (letter not in solution)
    colorizedGuess.forEach((cell, cellIndex) => {
      if (!cell.color) {
        colorizedGuess[cellIndex] = { letter: guess[cellIndex], color: "grey" }
      }
    })

    return colorizedGuess
  }

  // Used to color the keyboard tiles
  function updateHints(colorizedGuess) {
    const updatedGreenHints = new Set(hints.green)
    const updatedYellowHints = new Set(hints.yellow)
    const updatedGreyHints = new Set(hints.grey)

    colorizedGuess.forEach((cell) => {
      if (cell.color === "green") {
        updatedGreenHints.add(cell.letter)
      }
      //
      else if (cell.color === "yellow") {
        updatedYellowHints.add(cell.letter)
      }
      //
      else if (cell.color === "grey") {
        updatedGreyHints.add(cell.letter)
      }
    })

    const newHints = { green: updatedGreenHints, yellow: updatedYellowHints, grey: updatedGreyHints }
    setHints(newHints)
  }

  // Used for challenge mode, generates a random starting word that always has exactly one letter in the correct spot
  function generateRandomFirstGuess(solution) {

  }

  return (
    <>
    <NavBar />

    {isGameActive ? (
      <div className="game-container">
      <AlertModal
        showAlertModal={showAlertModal}
        setShowAlertModal={setShowAlertModal}
        message={alertMessage}
      />
      {isGameWon ? (
        <div className="win-message">
          <h2>Congratulations! You guessed the word!</h2>
          <button onClick={resetStates}>Play Again</button>
        </div>
      ) : null}
      {isOutOfGuesses ? (
        <div className="loss-message">
          <h2>Truly unfortunate. Maybe next time bud.</h2>
          <button onClick={resetStates}>Play Again</button>
        </div>
      ) : null}
      <GameBoard board={board}/>
      <Keyboard
        handleKeyPress={handleKeyPress}
        hints={hints}
        />
    </div>
    ) : (
      <Menu
      startNewGame={startNewGame}
      gameMode={gameMode}
      setGameMode={setGameMode}
      connectionMode={connectionMode}
      setConnectionMode={setConnectionMode}
      />
    )}
      
    </>
  )
}

export default App
