import React, { useState } from 'react'
import Keyboard from './Keyboard'

function GameBoard({ board }) {

  return (
    <div className="game-board">
        {board.map((row, rowIndex) => (
            <div key={rowIndex} className="game-board__row">
                {row.map((cell, cellIndex) => (
                    <div key={cellIndex} className="game-board__tile">
                        {cell}
                    </div>
                ))}
            </div>
        ))}
    </div>
  )
}

export default GameBoard