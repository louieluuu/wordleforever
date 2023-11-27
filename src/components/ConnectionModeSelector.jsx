import React from 'react'
import Card from './Card'

function ConnectionModeSelector({
    connectionMode,
    setConnectionMode,
    paragraphWrapper,
}) {
    const connectionModes = ['Offline', 'Online']

    const gameModeDescriptions = {
        'Offline': "Single player mode",
        'Online': "Queue into a Wordle Battle with other users",
    }

  return (
    <div className="card-container">
        {connectionModes.map((mode, index) => (
            <Card
            key={index}
            mode={mode}
            setMode={setConnectionMode}
            selected={mode === connectionMode}
            description={paragraphWrapper(gameModeDescriptions[mode])}
            >
            {mode}
            </Card>
        ))}
    </div>
  )
}

export default ConnectionModeSelector