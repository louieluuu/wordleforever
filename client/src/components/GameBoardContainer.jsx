import React from 'react'

import GameBoard from './GameBoard'

function GameBoardContainer({
    connectionMode,
    board,
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
        {connectionMode.includes('offline') ? (
            <GameBoard board={board} />
        ) : (
            <div className='boards-container'>
                {myInfo() ? (
                    <GameBoard key={myInfo().socketId} board={board} isUserBoard={true}/>
                ) : null}
                {otherUserInfo().map((obj) => (
                    <GameBoard key={obj.socketId} board={obj.gameBoard} isUserBoard={false}/>
                ))}
            </div>
        )}
    </>

  )
}

export default GameBoardContainer