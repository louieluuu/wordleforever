import React from "react"
import { IoIosFlame } from "react-icons/io"

function CompressedGameBoard({
  board = [],
  username,
  points,
  streak,
  connectionMode,
  isOutOfGuesses,
  isLeading,
}) {
  const lastRowIndex = getLastRowIndex(board)
  const isBoardEmpty = checkIsBoardEmpty(board)

  function getLastRowIndex(board) {
    let lastRowIndex = 0
    board.forEach((row, rowIndex) => {
      if (row[0].letter !== "" || row[0].color !== "") {
        lastRowIndex = rowIndex
      }
    })

    return lastRowIndex
  }

  function checkIsBoardEmpty(board) {
    if (board[0][0].color === "") {
      return true
    }
    return false
  }

  function getCellClassName(board, row, cellIndex) {
    let cellClassName = "compressed-game-board__cell"

    if (isBoardEmpty) {
      cellClassName += "--empty"
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
    <div
      className={`compressed-game-board${isOutOfGuesses ? "--game-over" : ""}`}
    >
      <div className="compressed-game-board-info">
        <span className="compressed-game-board-username">
          {isLeading && (
            <span className="compressed-game-board-crown">👑&nbsp;</span>
          )}
          {username}
        </span>
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
      <div className="compressed-game-board__row">
        {board[lastRowIndex].map((cell, cellIndex) => (
          <div
            key={cellIndex}
            className={getCellClassName(board, lastRowIndex, cellIndex)}
          >
            {cell.letter}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompressedGameBoard
