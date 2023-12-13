import React from 'react'

function LobbyInfo({
    gameMode,
    connectionMode,
}) {

  function formatMode(mode) {
    if (mode === "online-private") {
      return "Online (Private)"
    }
    if (mode === "online-public") {
      return "Online (Public)"
    }
    return mode
}

  return (
    <div className="lobby-info">{formatMode(connectionMode)} - {gameMode}</div>
  )
}

export default LobbyInfo