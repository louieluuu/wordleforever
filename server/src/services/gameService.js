import WORDLE_ANSWERS from "../data/wordleAnswers"

function generateSolution() {
    const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
    console.log("Solution is", newSolution)
    return newSolution
}

export { generateSolution }