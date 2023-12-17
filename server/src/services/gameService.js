import WORDLE_ANSWERS from "../data/wordleAnswers.js"

import { roomExists } from "./roomService.js"
import { getUserInfo, mapToArray, broadcastUserInfo } from "./userService.js"

function startGame(roomId, io) {
    if (roomExists(roomId)) {
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

function updateGameBoard(roomId, updatedGameBoard, io, socket) {
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
    updateGameBoard(roomId, updatedGameBoard, io, socket)
    broadcastGameBoard(roomId, io, socket)
}

function handleCorrectGuess(roomId, updatedGameBoard, io, socket) {
    updateGameBoard(roomId, updatedGameBoard, io, socket)
    broadcastUserInfo(roomId, io)
}

export { generateSolution, initializeGameBoards, startGame, handleWrongGuess, handleCorrectGuess }