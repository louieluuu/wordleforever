import React from 'react'

function Menu( { startNewGame }) {
  return (
    <div className="menu">
        <h1>Welcome to Wordle Battle!</h1>
        <p>
            Press the button below to begin a classic Wordle game.
        </p>
        <button onClick={startNewGame}>Start Game</button>
    </div>
  )
}

export default Menu