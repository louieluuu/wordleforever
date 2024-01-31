import React from "react"

import GameBoard from "./GameBoard"

function OnlineGameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  userInfo,
  isOutOfGuesses,
  isSpectating,
  isGameOver,
  showAlertModal,
  setShowAlertModal,
  message,
  hasSolved,
  isConfettiRunning,
  winningUserId,
  isPhoneLayout,
}) {
  function otherUserInfo() {
    return userInfo.slice(1) || []
  }

  function isUserLeading(currUserId) {
    if (connectionMode === "online-private") {
      let maxPoints = 0
      let leadingUser
      userInfo.forEach((userInfoObject) => {
        // If there are multiple "leaders", then there is no leader
        if (userInfoObject.points === maxPoints) {
          leadingUser = null
        }
        if (userInfoObject.points > maxPoints) {
          maxPoints = userInfoObject.points
          leadingUser = userInfoObject.userId
        }
      })
      if (leadingUser === currUserId) {
        return true
      }
    }
    return false
  }

  function getOtherBoardsClassName() {
    let otherBoardsClassName = "other-boards"
    if (isMoreThanTwoPlayers()) {
      otherBoardsClassName += "--grid"
    }
    if (isSpectating) {
      otherBoardsClassName += " spec"
    }
    return otherBoardsClassName
  }

  function isMoreThanTwoPlayers() {
    if (userInfo && userInfo.length > 2) {
      return true
    }
    return false
  }
  return (
    <>
      {!isSpectating ? (
        <div className="boards-container">
          <div className="user-board">
            {userInfo.length > 0 && (
              <GameBoard
                board={board}
                activeRow={activeRow}
                activeCell={activeCell}
                username={userInfo[0].username}
                points={userInfo[0].points}
                streak={userInfo[0].streak}
                connectionMode={connectionMode}
                isOutOfGuesses={isOutOfGuesses}
                isLeading={isUserLeading(userInfo[0].userId)}
                isUser={true}
                isGameOver={isGameOver}
                showAlertModal={showAlertModal}
                setShowAlertModal={setShowAlertModal}
                message={message}
                hasSolved={hasSolved}
                isConfettiRunning={isConfettiRunning}
                winningUser={userInfo[0].userId === winningUserId}
              />
            )}
          </div>
          <div className="other-boards-container">
            <div className={getOtherBoardsClassName()}>
              {isPhoneLayout
                ? otherUserInfo().map((obj) => (
                    <div key={obj.userId} className="other-board-container">
                      <GameBoard
                        board={obj.gameBoard}
                        username={obj.username}
                        points={obj.points}
                        streak={obj.streak}
                        connectionMode={connectionMode}
                        isOutOfGuesses={isOutOfGuesses}
                        isLeading={isUserLeading(obj.userId)}
                        isCompressed={isPhoneLayout}
                        isGameOver={isGameOver}
                        winningUser={obj.userId === winningUserId}
                      />
                    </div>
                  ))
                : otherUserInfo().map((obj) => (
                    <div key={obj.userId} className="other-board-container">
                      <GameBoard
                        board={obj.gameBoard}
                        username={obj.username}
                        points={obj.points}
                        streak={obj.streak}
                        connectionMode={connectionMode}
                        isOutOfGuesses={isOutOfGuesses}
                        isLeading={isUserLeading(obj.userId)}
                        isSmall={isMoreThanTwoPlayers()}
                        isGameOver={isGameOver}
                        winningUser={obj.userId === winningUserId}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="boards-container">
          <div className={getOtherBoardsClassName()}>
            {userInfo.length > 0 && isPhoneLayout ? (
              <>
                {userInfo.map((obj) => (
                  <GameBoard
                    key={obj.userId}
                    board={obj.gameBoard}
                    username={obj.username}
                    points={obj.points}
                    streak={obj.streak}
                    connectionMode={connectionMode}
                    isOutOfGuesses={isOutOfGuesses}
                    isLeading={isUserLeading(obj.userId)}
                    isCompressed={isPhoneLayout}
                    isGameOver={isGameOver}
                    winningUser={obj.userId === winningUserId}
                  />
                ))}
              </>
            ) : (
              <>
                {userInfo.map((obj) => (
                  <GameBoard
                    key={obj.userId}
                    board={obj.gameBoard}
                    username={obj.username}
                    points={obj.points}
                    streak={obj.streak}
                    connectionMode={connectionMode}
                    isOutOfGuesses={isOutOfGuesses}
                    isLeading={isUserLeading(obj.userId)}
                    isSmall={isMoreThanTwoPlayers()}
                    isGameOver={isGameOver}
                    winningUser={obj.userId === winningUserId}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default OnlineGameBoardContainer
