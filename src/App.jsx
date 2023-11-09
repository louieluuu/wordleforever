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
      handleBackspace(e)
    }
  }

  function handleLetter(e) {
    if (activeRowIndex < board.length) {
      const updatedBoard = board.map((row, rowIndex) => {
        if (rowIndex === activeRowIndex) {
          return row.map((cell, cellIndex) => {
            if (cellIndex === activeCellIndex) {
              return e.toUpperCase();
            } else {
              return cell;
            }
          });
        } else {
          return row;
        }
      });
      
      setBoard(updatedBoard);
      
      if (activeCellIndex + 1 >= updatedBoard[activeRowIndex].length) {
        if (activeRowIndex + 1 >= updatedBoard.length) {
          // You may handle end of game logic here
        } else {
          setActiveRowIndex(activeRowIndex + 1);
          setActiveCellIndex(0);
        }
      } else {
        setActiveCellIndex(activeCellIndex + 1);
      }
    }
  }

  function handleBackspace(e) {
    const updatedBoard = [...board];
      if (activeCellIndex > 0) {
        updatedBoard[activeRowIndex][activeCellIndex - 1] = '';
        setActiveCellIndex(activeCellIndex - 1);
        setBoard(updatedBoard);
      } else if (activeRowIndex > 0) {
        updatedBoard[activeRowIndex - 1][updatedBoard[activeRowIndex - 1].length - 1] = '';
        setActiveRowIndex(activeRowIndex - 1);
        setActiveCellIndex(updatedBoard[activeRowIndex - 1].length - 1);
        setBoard(updatedBoard);
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
