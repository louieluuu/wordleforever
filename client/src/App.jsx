import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import NavBar from './components/NavBar'
import Menu from './components/Menu'
import WaitingRoom from './components/WaitingRoom'
import GameContainer from './components/GameContainer'

function App() {

  const [gameMode, setGameMode] = useState('Easy')
  const [connectionMode, setConnectionMode] = useState('offline')

  const [username, setUsername] = useState(localStorage.getItem('username') || 'Wordler')
  const [isHost, setIsHost] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)

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
              setIsHost={setIsHost}
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
              connectionMode={connectionMode}
              setConnectionMode={setConnectionMode}
              setGameMode={setGameMode}
              isHost={isHost}
            />
            }
          />
          <Route
            path='/game/:roomId'
            element={
            <GameContainer
              gameMode={gameMode}
              connectionMode={connectionMode}
              isHost={isHost}
              setIsHost={setIsHost}
            />
            }
          />
          <Route
            path='/offline'
            element={
            <GameContainer
              gameMode={gameMode}
              connectionMode={connectionMode}
              isHost={isHost}
              setIsHost={setIsHost}
            />
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
