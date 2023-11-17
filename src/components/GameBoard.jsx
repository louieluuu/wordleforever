import React, { useState } from 'react'
import Keyboard from './Keyboard'

function GameBoard({
    board,
    activeRow,
    activeCell,
}) {

    function getCellClassName(board, row, cellIndex) {
        let cellClassName = "game-board__cell"
    
        if (board[row][cellIndex].color === "none") {
          if (row === activeRow && cellIndex < activeCell) {
            cellClassName += "--active"
          }
        } else if (board[row][cellIndex].color === "green") {
            cellClassName += "--green"
        } else if (board[row][cellIndex].color === "yellow") {
            cellClassName += "--yellow"
        } else if (board[row][cellIndex].color === "grey") {
            cellClassName += "--grey"
        }
        
        return cellClassName
      }
    
    return (
        <div className="game-board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="game-board__row">
                    {row.map((cell, cellIndex) => (
                        <div key={cellIndex} className={getCellClassName(board, rowIndex, cellIndex)}>
                            {cell.letter}
                        </div>
                    ))}
                </div>
            ))}
        </div>
  )
}

export default GameBoard