import VALID_WORDS from '../data/validWords.js'
import WORDLE_ANSWERS from '../data/wordleAnswers.js'

import {
    roomExists,
    resetRoomInfo,
    getRoomConnectionMode,
    getRoomSize,
    incrementCountGameOvers,
    getCountGameOvers,
    incrementCountOutOfGuesses,
    getCountOutOfGuesses,
    getRoomGameMode,
    setRoomInGame,
    setRoomOutOfGame,
    roomInLobby
} from './roomService.js'
import { getUserInfo, mapToArray, broadcastFinalUserInfo } from './userService.js'

function handleGameStart(roomId, io) {
    console.log('calling start game')
    if (roomExists(roomId) && roomInLobby(roomId)) {
        console.log('starting game')
        resetRoomInfo(roomId)
        initializeGameBoards(roomId)
        setRoomInGame(roomId)
        const newSolution = generateSolution()
        io.to(roomId).emit(
            'gameStarted',
            mapToArray(getUserInfo(roomId)),
            newSolution,
            (getRoomGameMode(roomId) === 'Challenge') ? generateRandomFirstGuess(newSolution) : null,
        )
    }
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

function initializeGameBoards(roomId) {
    if (roomExists(roomId)) {
        const allUserInfo = getUserInfo(roomId)
        allUserInfo.forEach((userInfo, socketId) => {
            allUserInfo.set(socketId, {
                ...userInfo,
                gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: '', color: '' })),
            })
        })
    }
}

function setGameBoard(roomId, updatedGameBoard, socket) {
    if (roomExists(roomId)) {
        const allUserInfo = getUserInfo(roomId)
        const currUserInfo = allUserInfo.get(socket.id)
        allUserInfo.set(socket.id, {
            ...currUserInfo,
            gameBoard: updatedGameBoard
        })
    }
}

function getGameBoard(roomId, socket) {
    return getUserInfo(roomId).get(socket.id).gameBoard
}

function broadcastGameBoard(roomId, io, socket) {
    if (roomExists(roomId)) {
        const noLettersBoard = getGameBoard(roomId, socket).map((row) => row.map((cell) => ({ ...cell, letter: ''})))
        io.to(roomId).emit('gameBoardsUpdated', socket.id, noLettersBoard)
    }
}

function handleWrongGuess(roomId, updatedGameBoard, io, socket) {
    setGameBoard(roomId, updatedGameBoard, socket)
    broadcastGameBoard(roomId, io, socket)
}

function handleCorrectGuess(roomId, updatedGameBoard, io, socket) {
    incrementCountGameOvers(roomId)
    setGameBoard(roomId, updatedGameBoard, socket)
    if (isGameOver(roomId, io)) {
        broadcastFinalUserInfo(roomId, io)
    } else {
        broadcastGameBoard(roomId, io, socket)
    }
}

function handleOutOfGuesses(roomId, io) {
    incrementCountGameOvers(roomId)
    incrementCountOutOfGuesses(roomId)
    if (isGameOver(roomId, io)) {
        broadcastFinalUserInfo(roomId, io)
    }
}

function isGameOver(roomId, io) {
    if (getRoomConnectionMode(roomId) === 'online-private') {
        if (getCountGameOvers(roomId) >= getRoomSize(roomId, io)) {
            setRoomOutOfGame(roomId)
            return true
        }
    } else if (getRoomConnectionMode(roomId) === 'online-public') {
        // TODO
    }
    return false
}

export {
    generateSolution,
    initializeGameBoards,
    handleGameStart,
    handleWrongGuess,
    handleCorrectGuess,
    handleOutOfGuesses
}