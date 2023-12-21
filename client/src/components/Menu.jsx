import { useNavigate } from 'react-router-dom'
import socket from '../socket'

// Components
import WelcomeMessage from './WelcomeMessage'
import GameModeSelector from './GameModeSelector'
import ConnectionModeSelector from './ConnectionModeSelector'

// Helpers
import { handleStartPrivateGame, handleStartPublicGame } from '../helpers/socketHelpers'

import { FaCirclePlay } from 'react-icons/fa6'

function Menu({
    username,
    setUsername,
    inputWidth,
    setInputWidth,
    gameMode,
    setGameMode,
    connectionMode,
    setConnectionMode,
    setIsHost,
}) {

    const navigate = useNavigate()

    async function handleStartButtonClick() {
        try {
            if (!gameMode || !connectionMode) {
                return
            }

            switch (connectionMode) {
                case 'online-private':
                    const privateRoomId = await handleStartPrivateGame(connectionMode, gameMode, setIsHost)
                    navigate(`/room/${privateRoomId}`)
                    break
                case 'online-public':
                    const publicRoomId = await handleStartPublicGame(connectionMode, gameMode, setIsHost)
                    navigate(`/room/${publicRoomId}`)
                    break
                case 'offline':
                    navigate('/offline')
                    break
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    // Used for styling text within cards
    function paragraphWrapper(description) {
        return <p>{description}</p>
    }

    let playButtonTitle = ''

    if (!gameMode && !connectionMode) {
        playButtonTitle = 'Please select a difficulty and game mode'
    } else if (!gameMode) {
        playButtonTitle = 'Please select a difficulty'
    } else if (!connectionMode) {
        playButtonTitle = 'Please select a game mode'
    }

    const playButtonClassName = `play-button ${playButtonTitle ? 'disabled' : 'clickable'}`

  return (
    <div className='menu'>
        <WelcomeMessage
            username={username}
            setUsername={setUsername}
            inputWidth={inputWidth}
            setInputWidth={setInputWidth}
        />
        <h3>Difficulty</h3>
        <GameModeSelector
            gameMode={gameMode}
            setGameMode={setGameMode}
            paragraphWrapper={paragraphWrapper}
        />
        <h3>Mode</h3>
        <ConnectionModeSelector
            connectionMode={connectionMode}
            setConnectionMode={setConnectionMode}
            paragraphWrapper={paragraphWrapper}
        />
        < FaCirclePlay
            className={playButtonClassName}
            onClick={handleStartButtonClick}
            title={playButtonTitle}
        />
    </div>
  )
}

export default Menu