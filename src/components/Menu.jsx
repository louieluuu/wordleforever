import React from 'react'
import GameModeSelector from './GameModeSelector'
import ConnectionModeSelector from './ConnectionModeSelector'

import { FaCirclePlay } from 'react-icons/fa6'

function Menu({
    startNewGame,
    gameMode,
    setGameMode,
    connectionMode,
    setConnectionMode,
}) {
  return (
    <div className="menu">
        <h1>Welcome to Wordle Battle!</h1>
        <h3>Difficulty</h3>
        <GameModeSelector
            gameMode={gameMode}
            setGameMode={setGameMode}
        />
        <h3>Mode</h3>
        <ConnectionModeSelector
            connectionMode={connectionMode}
            setConnectionMode={setConnectionMode}
        />
        < FaCirclePlay
        className="play-button"
        onClick={startNewGame}/>
    </div>
  )
}

export default Menu