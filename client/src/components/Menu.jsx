import { useState, useRef, useEffect } from "react"
import GameModeSelector from './GameModeSelector'
import ConnectionModeSelector from './ConnectionModeSelector'

import { FaCirclePlay } from 'react-icons/fa6'

function Menu({
    setRenderGame,
    gameMode,
    setGameMode,
    connectionMode,
    setConnectionMode,
    socket,
}) {

    const [username, setUsername] = useState(localStorage.getItem("username") || "Wordler")
    const [inputWidth, setInputWidth] = useState(0)
    const usernameRef = useRef(null)
    /** Seems a bit hacky but works, uses a hidden span element to measure the width and sets the input box size to that width. Dynamically sizing the input box was tricky */
    const textWidthRef = useRef(null)

    useEffect(() => {
        if (textWidthRef.current) {
            const textWidth = textWidthRef.current.clientWidth;
            setInputWidth(textWidth + 10)
        }
    }, [username, textWidthRef]);

    function handleUserNameChange(e) {
        const updatedUsername = e.target.value
    
        // Check if the input is empty or contains only spaces
        if (e.type === 'blur' && updatedUsername === '') {
            setUsername('Wordler')
        } else {
            // Enforce a length limit
            if (updatedUsername.length > 20) {
                return
            }
            setUsername(updatedUsername)
            localStorage.setItem("username", updatedUsername)
        }
    }

    function handleStartButtonClick() {
        if (gameMode && connectionMode) {
            setRenderGame(true)
            if (connectionMode === 'Online (Private)') {
                socket.emit('createRoom')
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

    function handleUserNameClick() {
        if (usernameRef.current) {
          setTimeout(() => {
            usernameRef.current.select();
          }, 0);
        }
      }

  return (
    <div className="menu">
        <div className="welcome-message">
            <h1>Welcome, </h1>
            <input
                ref={usernameRef}
                className="username"
                type="text"
                value={username}
                onChange={handleUserNameChange}
                onBlur={handleUserNameChange}
                onClick={handleUserNameClick}
                style={{ width: `${inputWidth}px` }}
            />
            <span ref={textWidthRef} className="hidden-span">{username}</span>
            <h1>!</h1>
        </div>
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