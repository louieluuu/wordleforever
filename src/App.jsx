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

  // Gameflow states
  const [isGameActive, setIsGameActive] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)

  // Gameplay states
  const [board, setBoard] = useState(Array(6).fill(Array(5).fill('')))
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [activeCellIndex, setActiveCellIndex] = useState(0)
  const [submittedGuesses, setSubmittedGuesses] = useState([])

  // Alert states
  const [alertMessage, setAlertMessage] = useState(".")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Solution
  const [solution, setSolution] = useState("")


  // Helper functions

  function resetStates() {
    setIsGameActive(true)
    setIsGameWon(false)
    setBoard(Array(6).fill(Array(5).fill('')))
    setActiveRowIndex(0)
    setActiveCellIndex(0)
    setSubmittedGuesses([])
    setShowAlertModal(false)
    generateSolution()
  }

  function handleKeyPress(e) {
    if (e.match(/^[a-zA-Z]$/)) {
      handleLetter(e)
    } else if (e === 'Backspace') {
      handleBackspace()
    } else if (e === 'Enter') {
      handleEnter();
    }
  }

  function handleLetter(e) {
    if (activeRowIndex < board.length) {
      const updatedBoard = board.map((row, rowIndex) => {
        if (rowIndex === activeRowIndex) {
          return row.map((cell, cellIndex) => {
            if (cellIndex === activeCellIndex && board[activeRowIndex][activeCellIndex] === '') {
              return e.toUpperCase();
            } else {
              return cell;
            }
          });
        } else {
          return row;
        }
      });

      if (activeCellIndex === updatedBoard[activeRowIndex].length) {
        return;
      }
      
      setBoard(updatedBoard);
      setActiveCellIndex(activeCellIndex + 1);
    }
  }

  function handleBackspace() {
    const updatedBoard = [...board];
      if (activeCellIndex === updatedBoard[activeRowIndex].length - 1 && updatedBoard[activeRowIndex][activeCellIndex] !== '') {
        updatedBoard[activeRowIndex][activeCellIndex] = '';
        setBoard(updatedBoard);
      }
      else if (activeCellIndex > 0) {
        updatedBoard[activeRowIndex][activeCellIndex - 1] = '';
        setActiveCellIndex(activeCellIndex - 1);
        setBoard(updatedBoard);
      }
  }

  function handleEnter() {
    const enteredWord = board[activeRowIndex]
      .filter(letter => letter !== '')
      .join('')
      .toLowerCase()

    if (enteredWord.length === 5) {
      if (enteredWord === solution) {
        console.log("game is won")
        setIsGameWon(true)
      }
      else if (VALID_WORDS.includes(enteredWord)) {
        setSubmittedGuesses([...submittedGuesses, activeRowIndex]);
        setActiveRowIndex(activeRowIndex + 1);
        setActiveCellIndex(0);
      } else {
        setAlertMessage("Not in word list")
        setShowAlertModal(true)
      }
    } else {
      setAlertMessage("Not enough letters")
      setShowAlertModal(true)
    }
  }

  function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)]
    setSolution(newSolution)
    console.log(newSolution)
  }

  function startNewGame() {
    setIsGameActive(true)
    resetStates()
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
      <GameBoard board={board}/>
      <Keyboard handleKeyPress={handleKeyPress}/>
    </div>
    ) : (
      <Menu startNewGame={startNewGame}/>
    )}
      
    </>
  )
}

export default App
