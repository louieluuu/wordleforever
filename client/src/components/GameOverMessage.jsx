import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { IoReturnDownBackSharp } from "react-icons/io5"

// Helpers
import { handleStartPublicGame } from '../helpers/socketHelpers'

// Data
import WIN_MESSAGES from '../data/winMessages'

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
    const [winMessage, setWinMessage] = useState('')

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

    useEffect(() => {
        const message = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
        setWinMessage(message)
    }, [])

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
                    <div className='post-game-message'>
                        {winMessage}
                    </div>
                </>
            ) : (
                <div className='post-game-message'>
                    Game Over
                </div>
            )}
            <button
                className='play-again-button'
                onClick={handlePlayAgain}>
                Play Again
                <IoReturnDownBackSharp/>
            </button>
        </>
        )}
    </>

  )
}

export default GameOverMessage