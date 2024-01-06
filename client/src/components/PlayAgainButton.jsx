import { useNavigate } from 'react-router-dom'
import { IoReturnDownBackSharp } from "react-icons/io5"

// Helpers
import { handleStartPublicGame } from '../helpers/socketHelpers'

function PlayAgainButton( {
    isGameOver,
    isHost,
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
                    const publicRoomId = await handleStartPublicGame(connectionMode, gameMode)
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
                {(connectionMode === 'online-public' || isHost) && (
                    <button
                        className='play-again-button'
                        onClick={handlePlayAgain}>
                        Play Again
                        <IoReturnDownBackSharp />
                    </button>
                )}
            </>
        )}
    </>

  )
}

export default PlayAgainButton