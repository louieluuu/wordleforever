import React from "react"
import { IoIosFlame } from "react-icons/io"

function GameBoard({
  board = [],
  username,
  activeRow,
  activeCell,
  points,
  streak,
  connectionMode,
  isOutOfGuesses,
  isLeading,
}) {
  function getCellClassName(board, row, cellIndex) {
    let cellClassName = "game-board__cell"

    if (board[row][cellIndex].color === "") {
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

  function getStreakClassName(streak) {
    let streakClassName = "streak"
    if (streak === 0) {
      streakClassName += "--0"
    } else if (1 <= streak && streak <= 3) {
      streakClassName += "--1-3"
    } else if (4 <= streak && streak <= 6) {
      streakClassName += "--4-6"
    } else if (7 <= streak && streak <= 9) {
      streakClassName += "--7-9"
    } else {
      streakClassName += "--10"
    }
    return streakClassName
  }

  return (
    <div className={`game-board${isOutOfGuesses ? "--game-over" : ""}`}>
      <div className="game-board-info">
        {isLeading && <span style={{ fontSize: "0.70rem" }}>👑</span>}
        {username}
        {connectionMode === "online-private" && (
          <>
            &nbsp;-&nbsp;
            {points}
          </>
        )}
        {connectionMode === "online-public" && (
          <>
            &nbsp;-&nbsp;
            {streak}
            <IoIosFlame
              style={{ color: "hsl(1, 81%, 43%)" }}
              className={getStreakClassName(streak)}
            />
          </>
        )}
      </div>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="game-board__row">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={getCellClassName(board, rowIndex, cellIndex)}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default GameBoard
