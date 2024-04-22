import React, { useState, useEffect } from "react"

// Components
import AlertModal from "./AlertModal"
import Streak from "./Streak"
import Crown from "./Crown"

// SVG
import star from "../assets/star.svg"

function GameBoard({
  board = [],
  displayName,
  activeRow,
  activeCell,
  points,
  streak,
  connectionMode,
  gameMode,
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
    if (connectionMode === "public") {
      if (isOutOfGuesses) {
        boardClassName += "--game-over"
      }
    } else if (connectionMode === "private") {
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

  function getDisplayNameClassName() {
    return addPrefix("game-board-display-name")
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

  // This whole useEffect scares me, don't really understand it but it kind of works? It bugs out a lot but a lot of safeguards were put in to ensure no incorrect information will be displayed
  // Ex: sometimes when the game ends, I think this component mounts again? The loop is running with the boards final points but with a prevPoints of 0, which should only get reset to 0 when the component mounts
  // Shouldn't break anything due to the conditional in the setDisplayPoints
  // Functionality elsewhere doesn't rely on this anyways, points is stored separately
  // The safeguards are to guard from displaying the wrong information, which hopefully this does
  useEffect(() => {
    if (connectionMode === "private") {
      if (points === 0) {
        setDisplayPoints(0)
      } else {
        let pointDiff = points - prevPoints

        let pointTimeout = setTimeout(function incrementPoints() {
          if (pointDiff <= 0) {
            clearTimeout(pointTimeout)
          } else {
            setDisplayPoints((prevDisplayPoints) => {
              if (prevDisplayPoints < points) {
                return prevDisplayPoints + 1
              } else {
                return prevDisplayPoints
              }
            })
            pointDiff--
            setTimeout(incrementPoints, getPointTimeout(pointDiff))
          }
        }, getPointTimeout(pointDiff))
      }

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
        <span className={getDisplayNameClassName()}>
          {isLeading && (
            <>
              <Crown />
              &nbsp;
            </>
          )}
          {displayName}
        </span>
        {connectionMode === "private" && (
          <>
            &nbsp;-&nbsp;
            {displayPoints}
          </>
        )}
        {connectionMode === "public" && (
          <>
            &nbsp;-&nbsp;
            <Streak
              streak={streak}
              connectionMode={connectionMode}
              gameMode={gameMode}
              inGame={true}
              renderNumber={true}
            />
          </>
        )}
      </div>
      <div className="board">
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
        {connectionMode === "private" &&
          !isUser &&
          winningUser &&
          !isGameOver && (
            <div className="winner-star">
              <img src={star} alt="Star" />
            </div>
          )}
      </div>
    </div>
  )
}

export default GameBoard
