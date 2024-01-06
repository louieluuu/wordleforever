// Classes
import Game from '../classes/Game.js'

// Services
import {
    isRoomChallengeMode,
    getUsersInRoom,
    getRoomConnectionMode,
    setRoomInGame,
    setRoomOutOfGame,
    roomInLobby,
} from './roomService.js'
import { handleUserStreakUpdates } from './userService.js'

// Lock
import AsyncLock from 'async-lock'
const lock = new AsyncLock()

const Games = new Map()

// For now games will be indexed by roomId and deleted when the room is deleted
// Possible new feature: store game info in DB for match history, in which case they'll need a new gameId
function initializeGameInfo(roomId) {
    // Should only be set for subsequent games in private games, games should be deleted upon room deletion
    let prevPoints = new Map()
    if (Games.has(roomId)) {
        prevPoints = Games.get(roomId)
        deleteGame(roomId)
    }
    const game = new Game(getUsersInRoom(roomId), prevPoints, isRoomChallengeMode(roomId))
    Games.set(roomId, game)
}

// Maybe eventually store games in a DB instead for match history info, for now they are deleted upon completion
function deleteGame(roomId) {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
        Games.delete(roomId)
    }
}

async function handleGameStart(roomId, io) {
    try {
        await lock.acquire('gameStartLock', async() => {
            if (roomId && roomInLobby(roomId)) {
                setRoomInGame(roomId)
                initializeGameInfo(roomId)
                const game = Games.get(roomId)
                if (game && game instanceof Game) {
                    game.startGame(roomId)
                }
            } else {
                console.error('Invalid roomId for starting game')
            }
        })
    } catch (error) {
        console.error('Error acquiring lock:', error)
    }
}

function handleWrongGuess(roomId, userId, updatedGameBoard, io) {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
        game.setGameBoard(userId, updatedGameBoard)
        game.broadcastNoLetterGameBoard(roomId, userId, io)
    }
}

async function handleCorrectGuess(roomId, userId, updatedGameBoard, io) {
    try {
        const game = Games.get(roomId)
        if (game && game instanceof Game) {
            if (getRoomConnectionMode(roomId) === 'online-private') {
                game.updatePoints(userId)
            } else if (getRoomConnectionMode(roomId) === 'online-public') {
                game.updateStreaks(userId)
                await handleUserStreakUpdates(winnerUserId, roomId)
            }
            game.countGameOvers += 1
            game.setGameBoard(userId, updatedGameBoard)
            if (isGameOver(roomId)) {
                game.broadcastFinalUserInfo(roomId, io)
            } else {
                game.broadcastNoLetterGameBoard(roomId, userId, io)
            }
        }
    } catch (error) {
        console.error(`Error handling correct guess: ${error.message}`)
        throw error
    }
}

function handleOutOfGuesses(roomId, io) {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
        game.countGameOvers += 1
        game.countOutOfGuesses += 1
        if (isGameOver(roomId)) {
            game.broadcastFinalUserInfo(roomId, io)
        }
    }
}

function isGameOver(roomId) {
    const game = Games.get(roomId)
    if (game && game instanceof Game) {
        if (getRoomConnectionMode(roomId) === 'online-private') {
            if (game.countGameOvers >= game.roomSize) {
                setRoomOutOfGame(roomId)
                return true
            }
        } else if (getRoomConnectionMode(roomId) === 'online-public') {
            // bug here
            if (game.countGameOvers > 0) {
                return true
            }
        }
    }
    return false
}



export {
    deleteGame,
    handleGameStart,
    handleWrongGuess,
    handleCorrectGuess,
    handleOutOfGuesses
}