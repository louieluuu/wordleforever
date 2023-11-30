import React from 'react'

function LobbyInfo({
    gameMode,
    connectionMode,
}) {

  return (
    <div className="lobby-info">{connectionMode} - {gameMode}</div>
  )
}

export default LobbyInfo