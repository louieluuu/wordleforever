import React from 'react'
import Card from './Card'

function ConnectionModeSelector({ connectionMode, setConnectionMode }) {
    const connectionModes = ['Offline', 'Online']

  return (
    <div className="card-container">
        {connectionModes.map((mode, index) => (
            <Card
            key={index}
            mode={mode}
            setMode={setConnectionMode}
            selected={mode === connectionMode}
            description="Test"
            >
            {mode}
            </Card>
        ))}
    </div>
  )
}

export default ConnectionModeSelector