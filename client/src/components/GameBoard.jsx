import React, { useState, useEffect } from "react"
import { IoIosFlame } from "react-icons/io"

import AlertModal from "./AlertModal"

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
  isSmall,
  isCompressed,
  isUser = false,
  isGameOver,
  showAlertModal,
  setShowAlertModal,
  message,
  hasSolved,
  isConfettiRunning,
  winningUser,
}) {
  const [displayPoints, setDisplayPoints] = useState(0)
  const [prevPoints, setPrevPoints] = useState(0)
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

  function isBoardSolved(board) {
    return board[lastRowIndex].every((cell) => cell.color === "green")
  }

  function isBoardOutOfGuesses(board) {
    return lastRowIndex === 5 && !isBoardSolved(board)
  }

  function addPrefix(baseName) {
    if (isSmall) {
      return "small-" + baseName
    } else if (isCompressed) {
      return "compressed-" + baseName
    }
    return baseName
  }

  function getBoardClassName() {
    let boardClassName = addPrefix("game-board")
    if (connectionMode === "online-public") {
      if (isOutOfGuesses) {
        boardClassName += "--game-over"
      }
    } else if (connectionMode === "online-private") {
      if (!isUser && !isGameOver && isBoardSolved(board)) {
        boardClassName += "--solved"
      } else if (!isUser && !isGameOver && isBoardOutOfGuesses(board)) {
        boardClassName += "--unsolved"
      }
    }

    return boardClassName
  }

  function getCellClassName(board, row, cellIndex) {
    let cellClassName = addPrefix("game-board__cell")

    if (isBoardEmpty && isCompressed) {
      cellClassName += "--empty"
    } else {
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
    }

    if (isGameOver && winningUser) {
      cellClassName += " winner"
    } else if (isGameOver && !winningUser) {
      cellClassName += " loser"
    } else if (
      lastRowIndex === 4 &&
      !isBoardSolved(board) &&
      !isUser &&
      !isGameOver
    ) {
      cellClassName += " last-guess"
    }

    return cellClassName
  }

  function getRowClassName() {
    return addPrefix("game-board__row")
  }

  function getInfoClassName() {
    return addPrefix("game-board-info")
  }

  function getUsernameClassName() {
    return addPrefix("game-board-username")
  }

  function getCrownClassName() {
    return addPrefix("game-board-crown")
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

  function getPointTimeout(pointDiff) {
    if (pointDiff > 35) {
      return 5
    } else if (pointDiff > 10) {
      return 20
    } else if (pointDiff > 3) {
      return 50
    } else if (pointDiff > 0) {
      return 100
    }
    return 0
  }

  useEffect(() => {
    if (connectionMode === "online-private") {
      let pointDiff = points - prevPoints

      let pointTimeout = setTimeout(function incrementPoints() {
        if (pointDiff <= 0) {
          clearTimeout(pointTimeout)
        } else {
          setDisplayPoints((prevDisplayPoints) => prevDisplayPoints + 1)
          pointDiff--
          setTimeout(incrementPoints, getPointTimeout(pointDiff))
        }
      }, getPointTimeout(pointDiff))

      setPrevPoints(points)
    }
  }, [points])

  return (
    <div className={getBoardClassName()}>
      {isUser && (
        <AlertModal
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          message={message}
          isGameOver={isGameOver}
          hasSolved={hasSolved}
          isConfettiRunning={isConfettiRunning}
          inGame={true}
        />
      )}

      <div className={getInfoClassName()}>
        <span className={getUsernameClassName()}>
          {isLeading && <span className={getCrownClassName()}>👑&nbsp;</span>}
          {username}
        </span>
        {connectionMode === "online-private" && (
          <>
            &nbsp;-&nbsp;
            {displayPoints}
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
      {!isCompressed ? (
        board.map((row, rowIndex) => (
          <div key={rowIndex} className={getRowClassName()}>
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={getCellClassName(board, rowIndex, cellIndex)}
              >
                {cell.letter}
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className={getRowClassName()}>
          {board[lastRowIndex].map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={getCellClassName(board, lastRowIndex, cellIndex)}
            >
              {cell.letter}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GameBoard
