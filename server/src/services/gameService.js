import WORDLE_ANSWERS from '../data/wordleAnswers.js'

import { roomExists, resetRoomInfo, getRoomConnectionMode, getRoomSize, incrementCountGameOvers, getCountGameOvers, incrementCountOutOfGuesses, getCountOutOfGuesses } from './roomService.js'
import { getUserInfo, mapToArray, broadcastUserInfo } from './userService.js'

function startGame(roomId, io) {
    if (roomExists(roomId)) {
        resetRoomInfo(roomId)
        initializeGameBoards(roomId)
        io.to(roomId).emit(
            'gameStarted',
            mapToArray(getUserInfo(roomId)),
            generateSolution(),
        )
    }
}

function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    console.log('Solution is', newSolution)
    return newSolution
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
        broadcastUserInfo(roomId, io)
    } else {
        broadcastGameBoard(roomId, io, socket)
    }
}

function handleOutOfGuesses(roomId, io) {
    incrementCountGameOvers(roomId)
    incrementCountOutOfGuesses(roomId)
    if (isGameOver(roomId, io)) {
        broadcastUserInfo(roomId, io)
    }
}

function isGameOver(roomId, io) {
    if (getRoomConnectionMode(roomId) === 'online-private') {
        if (getCountGameOvers(roomId) >= getRoomSize(roomId, io)) {
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
    startGame,
    handleWrongGuess,
    handleCorrectGuess,
    handleOutOfGuesses
}