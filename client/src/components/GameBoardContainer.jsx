import React from "react"

import GameBoard from "./GameBoard"

function GameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  username,
  userInfo,
}) {
  function otherUserInfo() {
    return userInfo.slice(1) || []
  }

  return (
    <>
      {connectionMode === "offline" ? (
        <GameBoard
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          username={username}
          connectionMode={connectionMode}
        />
      ) : (
        <div className="boards-container">
          {userInfo.length > 0 && (
            <GameBoard
              key={userInfo[0].userId}
              board={board}
              activeRow={activeRow}
              activeCell={activeCell}
              username={userInfo[0].username}
              points={userInfo[0].points}
              streak={userInfo[0].streak}
              connectionMode={connectionMode}
            />
          )}
          {otherUserInfo().map((obj) => (
            <GameBoard
              key={obj.userId}
              board={obj.gameBoard}
              username={obj.username}
              points={obj.points}
              streak={obj.streak}
              connectionMode={connectionMode}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default GameBoardContainer
