import React from 'react'
import { useNavigate } from 'react-router-dom'

// Helpers
import { handleStartPublicGame } from '../helpers/socketHelpers'

function GameOverMessage( {
    isGameOver,
    isGameWon,
    isHost,
    setIsHost,
    startNewGame,
    gameMode,
    connectionMode,
}) {

    const navigate = useNavigate()

    async function handlePlayAgain() {
        try {
            if (!gameMode || !connectionMode) {
                return
            }

            switch (connectionMode) {
                case 'online-private':
                    startNewGame()
                    break
                case 'online-public':
                    const publicRoomId = await handleStartPublicGame(connectionMode, gameMode, setIsHost)
                    navigate(`/room/${publicRoomId}`)
                    break
                case 'offline':
                    startNewGame()
                    break
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }
    
  return (
    <>
        {isGameOver && (
        <>
            {isGameWon ? (
                <div className='win-message'>
                    <h2>Congratulations! You guessed the word!</h2>
                </div>
            ) : (
                <div className='loss-message'>
                    <h2>Truly unfortunate. Maybe next time bud.</h2>
                </div>
            )}
            <button onClick={handlePlayAgain}>Play Again</button>
        </>
        )}
    </>

  )
}

export default GameOverMessage