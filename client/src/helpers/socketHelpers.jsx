import socket from '../socket'

function handleStartPrivateGame(connectionMode, gameMode, setIsHost) {
    return new Promise((resolve, reject) => {
        socket.emit('createRoom', connectionMode, gameMode)

        socket.on('roomCreated', (roomId) => {
            console.log('roomid is ', roomId)
            setIsHost(true)
            resolve(roomId)
        })

        socket.on('error', reject)
        setTimeout(() => reject(new Error('Timeout')), 5000)
    })
}

function handleStartPublicGame(connectionMode, gameMode, setIsHost) {
    return new Promise((resolve, reject) => {
        socket.emit('findMatch', gameMode)

        socket.on('matchFound', (roomId) => {
            resolve(roomId)
        })

        socket.on('noMatchesFound', () => {
            socket.emit('createRoom', connectionMode, gameMode)
        })

        socket.on('roomCreated', (roomId) => {
            setIsHost(true)
            resolve(roomId)
        })

        socket.on('error', reject)
        setTimeout(() => reject(new Error('Timeout')), 5000)
    })
}

export { handleStartPrivateGame, handleStartPublicGame }