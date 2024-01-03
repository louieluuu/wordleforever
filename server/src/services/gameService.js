// Data
import VALID_WORDS from '../data/validWords.js'
import WORDLE_ANSWERS from '../data/wordleAnswers.js'

// Database models
import { Game, User } from '../database/models.js'

// Services
import {
    isRoomChallengeMode,
    getUsersInRoom,
    getRoomConnectionMode,
    getRoomSize,
    setRoomInGame,
    setRoomOutOfGame,
    roomInLobby,
    getUserRoom,
} from './roomService.js'
import { getAllUserInfoInRoom, broadcastFinalUserInfo, getUser } from './userService.js'

// Lock
import AsyncLock from 'async-lock'
const lock = new AsyncLock()

// New Game object will be initialized each time, even on game restart
// The game record is deleted from the database when the game concludes
async function initializeGameInfo(roomId) {
    try {
        if (!await getGame(roomId)) {
            const newSolution = generateSolution()
            const game = new Game({
                roomId,
                solution: newSolution,
                startingWord: await isRoomChallengeMode(roomId) ? generateRandomFirstGuess(newSolution) : null,
                users: await getUsersInRoom(roomId),
                countGameOvers: 0,
                countOutOfGuesses: 0,
            })
            await game.save()
            console.log(`Game initialized and saved to the database: ${game.roomId}`)
        }
    } catch (error) {
        console.error(`Error initializing game info in the database: ${error.message}`)
        throw error
    }
}

async function getGame(roomId) {
    try {
        const game = await Game.findOne({ roomId }).lean()
        return game
    } catch (error) {
        console.error(`Error getting game info from the database: ${error.message}`)
        throw error
    }
}

async function deleteGame(roomId) {
    try {
        await resetGameBoards(roomId)
		await Game.deleteOne({ roomId })
    } catch (error) {
        console.error(`Error deleting game from the database: ${error.message}`)
        throw error
    }
}

async function getSolution(roomId) {
    try {
        const game = await getGame(roomId)
        return game ? game.solution : null
    } catch (error) {
        console.error(`Error getting solution from the database: ${error.message}`)
        throw error
    }
}

async function getStartingWord(roomId) {
    try {
        const game = await getGame(roomId)
        return game ? game.startingWord : null
    } catch (error) {
        console.error(`Error getting starting word from the database: ${error.message}`)
        throw error
    }
}

async function getUsersInGame(roomId) {
    try {
        const game = await getGame(roomId)
        return game ? game.users : null
    } catch (error) {
        console.error(`Error getting users in game from the database: ${error.message}`)
        throw error
    }
}

async function setGameBoard(userId, gameBoard) {
    try {
        await User.updateOne({ userId }, { $set: { gameBoard }})
    } catch (error) {
        console.error(`Error setting game board in the database: ${error.message}`)
        throw error
    }
}

async function getGameBoard(userId) {
    try {
        const user = await getUser(userId)
        return user ? user.gameBoard : null
    } catch (error) {
        console.error(`Error getting game board from the database: ${error.message}`)
        throw error
    }
}

async function resetGameBoards(roomId) {
    try {
        const users = await getUsersInGame(roomId)
        if (users) {
            const resetPromises = users.map(async (userId) => {
                await setGameBoard(userId, new Array(6).fill().map(() => new Array(5).fill({ letter: '', color: '' })))
            })
            await Promise.all(resetPromises)
        }
    } catch (error) {
        console.error(`Error resetting game boards in the database: ${error.message}`)
        throw error
    }
}


async function getCountGameOvers(roomId) {
    try {
        const game = await getGame(roomId)
        return game ? game.countGameOvers : 0
    } catch (error) {
        console.error(`Error getting count game overs from the database: ${error.message}`)
        throw error
    }
}

async function incrementCountGameOvers(roomId) {
    try {
		await Game.updateOne({ roomId }, { $inc: { countGameOvers: 1 } })
    } catch (error) {
        console.error(`Error incrementing countGameOvers in the database: ${error.message}`)
        throw error
    }
}

async function getCountOutOfGuesses(roomId) {
    try {
        const game = await getGame(roomId)
        return game ? game.countOutOfGuesses : 0
    } catch (error) {
        console.error(`Error getting count out of guesses from the database: ${error.message}`)
        throw error
    }
}

async function incrementCountOutOfGuesses(roomId) {
    try {
		await Game.updateOne({ roomId }, { $inc: { countOutOfGuesses: 1 } })
    } catch (error) {
        console.error(`Error incrementing countOutOfGuesses in the database: ${error.message}`)
        throw error
    }
}

async function updatePoints(userId) {
    try {
        const roomId = await getUserRoom(userId)
        const newPoints = await getRoomSize(roomId) - await getCountGameOvers(roomId) + await getCountOutOfGuesses(roomId)
        await User.updateOne({ userId }, { $inc: { points: newPoints }})
    } catch (error) {
        console.error(`Error updating user points in the database: ${error.message}`)
        throw error
    }
}

async function resetPoints(roomId) {
    try {
        const users = await getUsersInGame(roomId)
        if (users) {
            const resetPromises = users.map(async (userId) => {
                await User.updateOne({ userId }, { $set: { points: 0 }})
            })
            await Promise.all(resetPromises)
        }
    } catch (error) {
        console.error(`Error resetting points in the database: ${error.message}`)
        throw error
    }
}

async function broadcastGameBoard(roomId, userId, io) {
    if (roomId) {
        const userBoard = await getGameBoard(userId)
        const noLettersBoard = userBoard.map((row) => row.map((cell) => ({ ...cell, letter: ''})))
        io.to(roomId).emit('gameBoardsUpdated', userId, noLettersBoard)
    } else {
        console.error('Invalid roomId for broadcasting game board')
    }
}

async function handleGameStart(roomId, io) {
    try {
        await lock.acquire('gameStartLock', async() => {
            if (roomId && roomInLobby(roomId)) {
                await setRoomInGame(roomId)
                await initializeGameInfo(roomId)
                io.to(roomId).emit(
                    'gameStarted',
                    await getAllUserInfoInRoom(roomId),
                    await getSolution(roomId),
                    await getStartingWord(roomId),
                    )
            } else {
                console.error('Invalid roomId for starting game')
            }
        })
    } catch (error) {
        console.error('Error acquiring lock:', error)
    }
}

async function handleWrongGuess(roomId, userId, updatedGameBoard, io) {
    await setGameBoard(userId, updatedGameBoard)
    broadcastGameBoard(roomId, userId, io)
}

async function handleCorrectGuess(roomId, userId, updatedGameBoard, io) {
    await updatePoints(userId)
    await incrementCountGameOvers(roomId)
    await setGameBoard(userId, updatedGameBoard)
    if (await isGameOver(roomId)) {
        await broadcastFinalUserInfo(roomId, io)
        deleteGame(roomId)
    } else {
        broadcastGameBoard(roomId, userId, io)
    }
}

async function handleOutOfGuesses(roomId, io) {
    await incrementCountGameOvers(roomId)
    await incrementCountOutOfGuesses(roomId)
    if (await isGameOver(roomId)) {
        await broadcastFinalUserInfo(roomId, io)
        deleteGame(roomId)
    }
}

async function isGameOver(roomId) {
    if (await getRoomConnectionMode(roomId) === 'online-private') {
        if (await getCountGameOvers(roomId) >= await getRoomSize(roomId)) {
            await setRoomOutOfGame(roomId)
            return true
        }
    } else if (await getRoomConnectionMode(roomId) === 'online-public') {
        if (await getCountGameOvers(roomId) > 0) {
            return true
        }
    }
    return false
}

function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    console.log('Solution is', newSolution)
    return newSolution
}

// Used for challenge mode, generates a random starting word that always has exactly one letter in the correct spot
function generateRandomFirstGuess(solution) {
    let randomFirstGuess
    while (true) {
        randomFirstGuess = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)].toUpperCase()
        let numGreenLetters = 0
        for (let i = 0; i < randomFirstGuess.length; i++) {
            if (randomFirstGuess[i] === solution[i]) {
            numGreenLetters += 1
            }
        }
        if (numGreenLetters === 1) {
            return randomFirstGuess
        }
    }
}

export {
    resetPoints,
    generateSolution,
    handleGameStart,
    handleWrongGuess,
    handleCorrectGuess,
    handleOutOfGuesses
}