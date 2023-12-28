import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Helpers
import { handleStartPublicGame } from '../helpers/socketHelpers'
import Confetti from 'react-confetti'

function GameOverMessage( {
    isGameOver,
    isGameWon,
    setIsHost,
    startNewGame,
    gameMode,
    connectionMode,
}) {

    const navigate = useNavigate()
    const [isConfettiRunning, setIsConfettiRunning] = useState(false)

    useEffect(() => {
        const confettiTimer = setTimeout(() => {
            setIsConfettiRunning(false)
        }, 5000)

        return () => {
            clearTimeout(confettiTimer)
        }
    }, [isConfettiRunning])

    // Keep isConfettiRunning state up to date
    useEffect(() => {
        setIsConfettiRunning(isGameWon)

    }, [isGameOver])

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
                <>
                    {isConfettiRunning && <Confetti numberOfPieces={200} initialVelocityY={-10}/>}
                    <div className='win-message'>
                        <h2>Congratulations! You guessed the word!</h2>
                    </div>
                </>
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