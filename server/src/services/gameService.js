import WORDLE_ANSWERS from "../data/wordleAnswers.js"

import { getRoomsFromId, roomExists } from "./roomService.js"

function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    console.log("Solution is", newSolution)
    return newSolution
}

function initializeGameBoard(roomId, socket, io) {
    if (roomExists(roomId, socket)) {
        const rooms = getRoomsFromId(roomId)

        const currUserInfo = rooms.get(roomId).UserInfo
        currUserInfo.set(socket.id, {
            gameBoard: new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" })),
        })
    }    
}

export { generateSolution, initializeGameBoard }