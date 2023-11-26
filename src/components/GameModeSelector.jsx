import React from 'react'
import Card from './Card'

function GameModeSelector({ gameMode, setGameMode }) {
    const gameModes = ['Easy', 'Hard', 'Challenge']

  return (
    <div className="card-container">
        {gameModes.map((mode, index) => (
            <Card
            key={index}
            mode={mode}
            setMode={setGameMode}
            selected={mode === gameMode}
            description="Test"
            >
            {mode}
            </Card>
        ))}
    </div>
  )
}

export default GameModeSelector