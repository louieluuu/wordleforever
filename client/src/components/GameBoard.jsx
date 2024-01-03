import React from 'react'

function GameBoard({
    board=[],
    username,
    activeRow,
    activeCell,
    points,
    connectionMode,
    isUserBoard=false,
}) {

    function getCellClassName(board, row, cellIndex) {
        let cellClassName = 'game-board__cell'
    
        if (board[row][cellIndex].color === '') {
          if (row === activeRow && cellIndex < activeCell) {
            cellClassName += '--active'
          }
        } else if (board[row][cellIndex].color === 'green') {
            cellClassName += '--green'
        } else if (board[row][cellIndex].color === 'yellow') {
            cellClassName += '--yellow'
        } else if (board[row][cellIndex].color === 'grey') {
            cellClassName += '--grey'
        }

        if (isUserBoard) {
            cellClassName += ' user'
        }
        
        return cellClassName
      }
    
    return (
        <div className='game-board'>
            <div className='game-board-info'>
                {username}
                {connectionMode === 'online-private' && (
                    <>
                    &nbsp;-&nbsp;
                    {points}
                    </>
                )}
            </div>
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className='game-board__row'>
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