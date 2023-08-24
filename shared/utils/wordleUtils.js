// Defining functions that are shared between both the client and server
// (owing to the fact that you can play offline and online).

import { WORD_LIST } from "../data/wordList.js"
import { VALID_GUESSES } from "../data/validGuesses.js"

// Generates a random solution
export function getRandomSolution() {
  const randomSolution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    .toUpperCase()
    .split("")
  console.log(`Solution: ${randomSolution}`)
  return randomSolution
}

// Challenge Mode:
// generates a random starting word that always has exactly one green match
export function getRandomFirstGuess(solution) {
  let randomFirstGuess

  while (true) {
    randomFirstGuess = VALID_GUESSES[Math.floor(Math.random() * VALID_GUESSES.length)].toUpperCase()
    let countGreenLetters = 0
    for (let i = 0; i < randomFirstGuess.length; ++i) {
      if (randomFirstGuess[i] === solution[i]) {
        countGreenLetters += 1
      }
    }
    if (countGreenLetters === 1) {
      return randomFirstGuess.split("")
    }
  }
}

// Technically not a shared function. It's only used on the client-side, but all the other
// VALID_GUESSES logic is here, so...
export function isValidGuess(guess) {
  return VALID_GUESSES.includes(guess)
}

// TODO: this causes issues, but exporting them all individually works fine. Huh.
// export { getRandomSolution, getRandomFirstGuess, isValidGuess }
