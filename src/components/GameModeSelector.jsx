import React, { useState } from 'react'

function GameModeSelector({ gameMode, setGameMode }) {
    const gameModes = ['Easy Mode', 'Hard Mode', 'Challenge Mode']

    function handleSelect(mode) {
        setGameMode(mode)
    }

  return (
    <div className="card-container">
        {gameModes.map((mode, index) => (
            <div
            key={index}
            className={`game-mode${mode === gameMode ? " selected" : ""}`}
            onClick={() => handleSelect(mode)}
            >
            {mode}
            </div>
        ))}
    </div>
  )
}

export default GameModeSelector