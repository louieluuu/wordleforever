import { useState } from "react"

// Data
import VALID_WORDS from "./data/validWords"
import WORDLE_ANSWERS from "./data/wordleAnswers"

// Components
import NavBar from "./components/NavBar"
import GameBoard from "./components/GameBoard"
import Keyboard from "./components/Keyboard"
import AlertModal from "./components/AlertModal"

function App() {

  // Gameplay related states
  const [board, setBoard] = useState(Array(6).fill(Array(5).fill('')))
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [activeCellIndex, setActiveCellIndex] = useState(0)
  const [submittedGuesses, setSubmittedGuesses] = useState([])

  // Alert states
  const [alertMessage, setAlertMessage] = useState(".")
  const [showAlertModal, setShowAlertModal] = useState(false)


  // Helper functions

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
      
      if (activeCellIndex + 1 >= updatedBoard[activeRowIndex].length) {
        if (activeRowIndex + 1 >= updatedBoard.length) {
          // You may handle end of game logic here
        }
      } else {
        setActiveCellIndex(activeCellIndex + 1);
      }
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
      .filter(letter => letter !== '')  // Exclude blank spaces
      .join('')
      .toLowerCase()

    console.log(enteredWord)

    if (enteredWord.length === 5) {
      if (VALID_WORDS.includes(enteredWord)) {
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
  
  
  
  
  

  return (
    <>
    <NavBar />
      <div className="game-container">
        <AlertModal
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          message={alertMessage}
        />
        < GameBoard board={board} />
        < Keyboard handleKeyPress={handleKeyPress} />
      </div>
    </>
  )
}

export default App
