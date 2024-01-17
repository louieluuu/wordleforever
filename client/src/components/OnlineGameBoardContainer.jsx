import React from "react"
import { useMediaQuery } from "react-responsive"

import GameBoard from "./GameBoard"
import CompressedGameBoard from "./CompressedGameBoard"

function OnlineGameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  userInfo,
  isOutOfGuesses,
  isSpectating,
}) {
  // I'd rather pull the breakpoints from "../styles/_variables.scss", think you can do it with webpack but going to skip it for now
  const breakpointSm = "640px"
  const isPhone = useMediaQuery({ maxWidth: breakpointSm })
  const isDesktop = useMediaQuery({ minWidth: breakpointSm })
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
    if (userInfo && userInfo.length > 3) {
      otherBoardsClassName += `--grid`
    }
    return otherBoardsClassName
  }
  return (
    <>
      {!isSpectating ? (
        <div className="boards-container">
          <div className="user-board">
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
                isOutOfGuesses={isOutOfGuesses}
                isLeading={isUserLeading(userInfo[0].userId)}
              />
            )}
          </div>
          <div className={getOtherBoardsClassName()}>
            {isDesktop
              ? otherUserInfo().map((obj) => (
                  <GameBoard
                    key={obj.userId}
                    board={obj.gameBoard}
                    username={obj.username}
                    points={obj.points}
                    streak={obj.streak}
                    connectionMode={connectionMode}
                    isOutOfGuesses={isOutOfGuesses}
                    isLeading={isUserLeading(obj.userId)}
                  />
                ))
              : otherUserInfo().map((obj) => (
                  <CompressedGameBoard
                    key={obj.userId}
                    board={obj.gameBoard}
                    username={obj.username}
                    points={obj.points}
                    streak={obj.streak}
                    connectionMode={connectionMode}
                    isOutOfGuesses={isOutOfGuesses}
                    isLeading={isUserLeading(obj.userId)}
                  />
                ))}
          </div>
        </div>
      ) : (
        <div className="boards-container">
          {userInfo.length > 0 && (
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
                />
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}

export default OnlineGameBoardContainer
