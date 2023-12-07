import React from 'react'
import Card from './Card'

function GameModeSelector({
    gameMode,
    setGameMode,
    paragraphWrapper,
}) {
    const gameModes = ['Easy', 'Hard', 'Challenge']

    const gameModeDescriptions = {
        'Easy': "No extra imposed rules, choose whichever strategy works for you",
        'Hard': "Subsequent guesses must use all previously revealed hints",
        'Challenge': "First guess is randomly generated, subsequent guesses must use all previously revealed hints",
    }

  return (
    <div className="card-container">
        {gameModes.map((mode, index) => (
            <Card
            key={index}
            mode={mode}
            setMode={setGameMode}
            selected={mode === gameMode}
            description={paragraphWrapper(gameModeDescriptions[mode])}
            >
            </Card>
        ))}
    </div>
  )
}

export default GameModeSelector