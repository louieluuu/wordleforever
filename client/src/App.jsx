import { useState } from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import NavBar from "./components/NavBar"
import Menu from "./components/Menu"
import WaitingRoom from "./components/WaitingRoom"
import GameContainer from "./components/GameContainer"

function App() {

  const [username, setUsername] = useState(localStorage.getItem('username') || 'Wordler')
  const [inputWidth, setInputWidth] = useState(0)

  const [gameMode, setGameMode] = useState(null)
  const [connectionMode, setConnectionMode] = useState(null)

  return (
    <>
      <Router>
        <NavBar
          setGameMode={setGameMode}
          setConnectionMode={setConnectionMode}
        />
        <Routes>
          <Route
            path='/'
            element={
            <Menu
              username={username}
              setUsername={setUsername}
              inputWidth={inputWidth}
              setInputWidth={setInputWidth}
              gameMode={gameMode}
              setGameMode={setGameMode}
              connectionMode={connectionMode}
              setConnectionMode={setConnectionMode}
            />
            }
          />
          <Route
            path='/room/:roomId'
            element={
            <WaitingRoom
              username={username}
              setUsername={setUsername}
              inputWidth={inputWidth}
              setInputWidth={setInputWidth}
              setConnectionMode={setConnectionMode}
              setGameMode={setGameMode}
            />
            }
          />
          <Route
            path='/game/:roomId'
            element={
            <GameContainer
              gameMode={gameMode}
              connectionMode={connectionMode}
            />
            }
          />
          <Route
            path='/offline'
            element={
            <GameContainer
              gameMode={gameMode}
              connectionMode={connectionMode}
            />
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
