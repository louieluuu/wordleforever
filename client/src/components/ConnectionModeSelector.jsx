import React from 'react'
import Card from './Card'

function ConnectionModeSelector({
    connectionMode,
    setConnectionMode,
    paragraphWrapper,
}) {
    const connectionModes = ['Offline', 'online-private', 'online-public']

    const gameModeDescriptions = {
        'Offline': "Single player mode",
        'online-private': "Create a private room that your friends can join",
        'online-public': "Queue into a Wordle Battle with other users from around the world",

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