import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from '../socket'

// Components
import WelcomeMessage from './WelcomeMessage'
import CountdownModal from './CountdownModal'

function WaitingRoom({
    username,
    setUsername,
    inputWidth,
    setInputWidth,
    connectionMode,
    setConnectionMode,
    setGameMode,
    isHost,
}) {
    const navigate = useNavigate()
    const { roomId } = useParams()
    const [userInfo, setUserInfo] = useState([])
    const [showCountdownModal, setShowCountdownModal] = useState(false)

    // Main useEffect loop
    useEffect(() => {

        if (socket.id === undefined) {
            socket.on('connect', () => {
                socket.emit('joinRoom', roomId, username)
            })
        } else {
            socket.emit('joinRoom', roomId, username)
        }

        // Make sure modes are set, important for users joining from a link
        socket.on('roomJoined', (roomConnectionMode, roomGameMode) => {
            setConnectionMode(roomConnectionMode)
            setGameMode(roomGameMode)
        })

        socket.on('failedToJoinRoom', () => {
            // TODO: display some sort of error message for the user
            navigate('/')
        })

        socket.on('matchFound', () => {
            startCountdown()
        })

        socket.on('userInfoUpdated', (updatedUserInfo) => {
            setUserInfo(updatedUserInfo)
        })

        socket.on('countdownStarted', () => {
            setShowCountdownModal(true)
        })

        socket.on('countdownTick', () => {
            setShowCountdownModal(true)
        })

        socket.on('roomStarted', () => {
            navigate(`/game/${roomId}`)
        })

        return () => {
            socket.off('connect')
            socket.off('roomJoined')
            socket.off('failedToJoinRoom')
            socket.off('userInfoUpdated')
            socket.off('roomStarted')
        }
    }, [])

    // Keep username up to date
    useEffect(() => {
        socket.emit('updateUsername', roomId, username)
    }, [username])

    function startCountdown() {
        socket.emit('startCountdown', roomId)
    }

    function stopCountdown() {
        // TODO: display something to the user?
        socket.emit('stopCountdown', roomId)
        setShowCountdownModal(false)
    }

    // Keep track of number of users in room
    // Start countdown in public game when at least 2 users, stop when less than 2 users
    useEffect(() => {
        if (connectionMode.includes('public')) {
            if (userInfo.length > 1) {
                console.log('start countdown')
                startCountdown()
            } else if (userInfo.length < 2) {
                console.log('stop countdown')
                stopCountdown()
            }
        }

    }, [userInfo])

  return (
    <div>
        <WelcomeMessage
            username={username}
            setUsername={setUsername}
            inputWidth={inputWidth}
            setInputWidth={setInputWidth}
        />
        {showCountdownModal ? (
            <CountdownModal
                setShowCountdownModal={setShowCountdownModal}
            />
        ) : null}
        <h2>Waiting Room</h2>
        {connectionMode === 'online-private' ? (
            <button
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                }}
            >
            Copy Link
            </button>
        ) : null}

        <div>
            <h3>Users in the Room:</h3>
            <ul>
                {userInfo.map((info) => (
                    <li key={info.socketId}>{info.username}</li>
                ))}
            </ul>
        </div>
        {(connectionMode === 'online-private' && isHost) ? (
            <button onClick={startCountdown}>
                Start Game
            </button>
        ) : null}
    </div>
  )
}

export default WaitingRoom
