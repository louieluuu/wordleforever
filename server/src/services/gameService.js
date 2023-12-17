import WORDLE_ANSWERS from "../data/wordleAnswers.js"

import { roomExists } from "./roomService.js"
import { getUserInfo, mapToArray } from "./userService.js"

function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    console.log('Solution is', newSolution)
    return newSolution
}

function initializeGameBoard(roomId, socket) {
    if (roomExists(roomId)) {
        const allUserInfo = getUserInfo(roomId)
        const currUserInfo = allUserInfo.get(socket.id)
        allUserInfo.set(socket.id, {
            ...currUserInfo,
            gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: '', color: '' })),
        })
    }
}

function startGame(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit(
            'gameStarted',
            mapToArray(getUserInfo(roomId)),
            generateSolution(),
        )
    }
}

function updateGameBoard(roomId, updatedGameBoard, io, socket) {
    console.log('updating game board on server side')
    if (roomExists(roomId)) {
        const allUserInfo = getUserInfo(roomId)
        const currUserInfo = allUserInfo.get(socket.id)
        allUserInfo.set(socket.id, {
            ...currUserInfo,
            gameBoard: updatedGameBoard
        })

        // Only show the hints to other users, not the actual letters
        const noLettersBoard = updatedGameBoard.map((row) => row.map((cell) => ({ ...cell, letter: ''})))
        console.log('sending updated board to clients')
        io.to(roomId).emit('gameBoardsUpdated', socket.id, noLettersBoard)
    }
}

export { generateSolution, initializeGameBoard, startGame, updateGameBoard }