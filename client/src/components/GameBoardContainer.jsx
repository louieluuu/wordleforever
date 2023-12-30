import React from 'react'

import GameBoard from './GameBoard'

function GameBoardContainer({
    connectionMode,
    board,
    username,
    userInfo,
}) {

    function myInfo() {
        return userInfo[0]
    }

    function otherUserInfo() {
        return userInfo.slice(1) || []
    }

  return (
    <>
        {connectionMode === 'offline' ? (
            <GameBoard board={board} username={username} />
        ) : (
            <div className='boards-container'>
                <GameBoard board={board} username={username} isUserBoard={true}/>
                {otherUserInfo().map((obj) => (
                    <GameBoard key={obj.userId} board={obj.gameBoard} username={obj.username} isUserBoard={false}/>
                ))}
            </div>
        )}
    </>

  )
}

export default GameBoardContainer