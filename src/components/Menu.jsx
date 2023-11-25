import React from 'react'
import GameModeSelector from './GameModeSelector'
import ConnectionModeSelector from './ConnectionModeSelector'

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
        <GameModeSelector
            gameMode={gameMode}
            setGameMode={setGameMode}
        />
        <ConnectionModeSelector
            connectionMode={connectionMode}
            setConnectionMode={setConnectionMode}
        />
        <button onClick={startNewGame}>Start Game</button>
    </div>
  )
}

export default Menu