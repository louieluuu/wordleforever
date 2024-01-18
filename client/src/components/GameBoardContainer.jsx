import React from "react"

// Components
import GameBoard from "./GameBoard"
import OnlineGameBoardContainer from "./OnlineGameBoardContainer"

function GameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  username,
  userInfo,
  isOutOfGuesses,
  isSpectating,
  isGameOver,
}) {
  return (
    <>
      {connectionMode === "offline" ? (
        <div className="offline-board">
          <GameBoard
            board={board}
            activeRow={activeRow}
            activeCell={activeCell}
            connectionMode={connectionMode}
            isOutOfGuesses={isOutOfGuesses}
            isGameOver={isGameOver}
          />
        </div>
      ) : (
        <OnlineGameBoardContainer
          connectionMode={connectionMode}
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          userInfo={userInfo}
          isOutOfGuesses={isOutOfGuesses}
          isSpectating={isSpectating}
          isGameOver={isGameOver}
        />
      )}
    </>
  )
}

export default GameBoardContainer
