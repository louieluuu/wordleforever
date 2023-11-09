import { useState } from "react"

// Components
import NavBar from "./components/NavBar"
import GameBoard from "./components/GameBoard"
import Keyboard from "./components/Keyboard"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <NavBar />
      <div className="game-container">
        < GameBoard />
        < Keyboard />
      </div>
      
      
    </>
  )
}

export default App
