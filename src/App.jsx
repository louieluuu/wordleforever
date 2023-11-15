import { useState } from "react"

// Components
import NavBar from "./components/NavBar"
import GameBoard from "./components/GameBoard"
import Keyboard from "./components/Keyboard"

function App() {
  const [board, setBoard] = useState(Array(6).fill(Array(5).fill('')))
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [activeCellIndex, setActiveCellIndex] = useState(0)


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
      if (activeCellIndex === updatedBoard[activeRowIndex].length - 1 && updatedBoard[activeRowIndex][activeCellIndex] != '') {
        console.log("numba 1")
        console.log(activeCellIndex)
        updatedBoard[activeRowIndex][activeCellIndex] = '';
        setBoard(updatedBoard);
      }
      else if (activeCellIndex > 0) {
        console.log("numba 2")
        console.log(activeCellIndex)
        updatedBoard[activeRowIndex][activeCellIndex - 1] = '';
        setActiveCellIndex(activeCellIndex - 1);
        setBoard(updatedBoard);
      }
  }

  function handleEnter() {
    if (activeRowIndex < board.length && activeCellIndex === board[activeRowIndex].length - 1) {
      setActiveRowIndex(activeRowIndex + 1)
      setActiveCellIndex(0)
    }
  }

  return (
    <>
    <NavBar />
      <div className="game-container">
        < GameBoard board={board} />
        < Keyboard handleKeyPress={handleKeyPress} />
      </div>
      
      
    </>
  )
}

export default App
