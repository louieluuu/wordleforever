import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Components
import WelcomeMessage from './WelcomeMessage'
import MenuLandingPage from './MenuLandingPage'
import MenuOnlineModes from './MenuOnlineModes'
import MenuOfflineModes from './MenuOfflineModes'
import WaitingRoom from './WaitingRoom'

function MenuRoutes({
    username,
    setUsername,
    inputWidth,
    setInputWidth,
    gameMode,
    setGameMode,
    connectionMode,
    setConnectionMode,
    isHost,
    setIsHost,
}) {
    return (
        <>
        <WelcomeMessage
            username={username}
            setUsername={setUsername}
            inputWidth={inputWidth}
            setInputWidth={setInputWidth}
        />
        <AnimatePresence mode='wait'>
            <Routes>
                <Route path='/' element={<MenuLandingPage />}/>
                <Route
                    path='/online'
                    element={
                        <MenuOnlineModes
                            gameMode={gameMode}
                            setConnectionMode={setConnectionMode}
                            setIsHost={setIsHost}
                        />
                    }
                />
                <Route
                    path='/offline'
                    element={
                        <MenuOfflineModes
                            setConnectionMode={setConnectionMode}
                        />
                    }
                />
                <Route
                    path='/room/:roomId'
                    element={
                        <WaitingRoom
                            username={username}
                            connectionMode={connectionMode}
                            setConnectionMode={setConnectionMode}
                            setGameMode={setGameMode}
                            isHost={isHost}
                        />
                    }
                />
            </Routes>
        </AnimatePresence>
        </>
    )
}

export default MenuRoutes