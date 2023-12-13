import { useState, useRef, useEffect } from "react"
import { useNavigate } from 'react-router-dom'

import WelcomeMessage from "./WelcomeMessage"
import GameModeSelector from './GameModeSelector'
import ConnectionModeSelector from './ConnectionModeSelector'

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
    socket,
}) {

    const navigate = useNavigate()

    function handleStartButtonClick() {
        if (gameMode && connectionMode) {
            if (connectionMode === 'online-private') {
                socket.emit('createRoom', connectionMode)

                socket.on('roomCreated', (roomId) => {
                    navigate(`/room/${roomId}`)
                })
            } else {
                // For now this will also include public games, implementing private games first
                navigate('/offline')
            }
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
    <div className="menu">
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