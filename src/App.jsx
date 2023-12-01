import { useState } from "react"

// Components
import NavBar from "./components/NavBar"
import Menu from "./components/Menu"
import GameContainer from "./components/GameContainer"

function App() {

  const [renderGame, setRenderGame] = useState(false)

  const [gameMode, setGameMode] = useState(null)
  const [connectionMode, setConnectionMode] = useState(null)

  return (
    <>
      <NavBar />

      {renderGame ? (
        <GameContainer
          gameMode={gameMode}
          connectionMode={connectionMode}
        />
      ) : (
        <Menu
          startGame={setRenderGame}
          gameMode={gameMode}
          setGameMode={setGameMode}
          connectionMode={connectionMode}
          setConnectionMode={setConnectionMode}
        />
      )}
    </>
  );
}

export default App
