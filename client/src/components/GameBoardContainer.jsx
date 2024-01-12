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
}) {

  return (
    <>
      {connectionMode === "offline" ? (
        <GameBoard
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          username={username}
          connectionMode={connectionMode}
          isOutOfGuesses={isOutOfGuesses}
        />
      ) : (
        <OnlineGameBoardContainer
          connectionMode={connectionMode}
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          userInfo={userInfo}
          isOutOfGuesses={isOutOfGuesses}
          isSpectating={isSpectating}
        />
      )}
    </>
  )
}

export default GameBoardContainer
