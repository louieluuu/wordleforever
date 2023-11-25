import React from 'react'

function ConnectionModeSelector({ connectionMode, setConnectionMode }) {
    const connectionModes = ['Offline Mode', 'Online Mode']

    function handleSelect(mode) {
        setConnectionMode(mode)
    }

  return (
    <div className="card-container">
        {connectionModes.map((mode, index) => (
            <div
            key={index}
            className={`connection-mode${mode === connectionMode ? " selected" : ""}`}
            onClick={() => handleSelect(mode)}
            >
            {mode}
            </div>
        ))}
    </div>
  )
}

export default ConnectionModeSelector