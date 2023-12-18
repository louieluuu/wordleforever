import React from 'react'

function GameOverMessage( {
    isGameOver,
    isGameWon,
    isHost,
    startNewGame,
}) {
    
  return (
    <>
        {isGameOver && (
        <>
            {isGameWon ? (
                <div className='win-message'>
                    <h2>Congratulations! You guessed the word!</h2>
                    {isHost && <button onClick={startNewGame}>Play Again</button>}
                </div>
            ) : (
                <div className='loss-message'>
                    <h2>Truly unfortunate. Maybe next time bud.</h2>
                    {isHost && <button onClick={startNewGame}>Play Again</button>}
                </div>
            )}
        </>
        )}
    </>

  )
}

export default GameOverMessage