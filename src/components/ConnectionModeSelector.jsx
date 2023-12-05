import React from 'react'
import Card from './Card'

function ConnectionModeSelector({
    connectionMode,
    setConnectionMode,
    paragraphWrapper,
}) {
    const connectionModes = ['Offline', 'Online (Private)', 'Online (Public)']

    const gameModeDescriptions = {
        'Offline': "Single player mode",
        'Online (Private)': "Create a private lobby that your friends can join",
        'Online (Public)': "Queue into a Wordle Battle with other users from around the world",

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
            </Card>
        ))}
    </div>
  )
}

export default ConnectionModeSelector