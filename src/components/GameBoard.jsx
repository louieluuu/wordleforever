import React from "react"

function GameBoard({
  gameBoard,
  nickname,
  streak,
  points,
  userGuess,
  currentRow,
  currentTile,
  isGameOver,
  isOutOfGuesses,
}) {
  function getGuessTileClassName(gameBoard, row, col) {
    let guessTileClassName = "guess__tile"

    if (gameBoard[row][col].color === "none") {
      if (row === currentRow && col < currentTile && !isGameOver) {
        guessTileClassName += "--active"
      }
    }
    //
    else if (gameBoard[row][col].color === "correct") {
      guessTileClassName += "--correct"
    }
    //
    else if (gameBoard[row][col].color === "wrong-position") {
      guessTileClassName += "--wrong-position"
    }
    //
    else if (gameBoard[row][col].color === "wrong") {
      guessTileClassName += "--wrong"
    }

    return guessTileClassName
  }

  return (
    <>
      <div className={`game-board${isOutOfGuesses ? "--game-over" : ""}`}>
        <div style={{ fontFamily: "Roboto Slab", display: "flex" }}>{`${nickname}:`}</div>
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="guess">
            {rowIndex === currentRow
              ? userGuess.map((letter, index) => (
                  <div key={index} className={getGuessTileClassName(gameBoard, rowIndex, index)}>
                    {letter}
                  </div>
                ))
              : row.map((tile, tileIndex) => (
                  <div
                    key={tileIndex}
                    className={getGuessTileClassName(gameBoard, rowIndex, tileIndex)}>
                    {tile.letter}
                  </div>
                ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default GameBoard
