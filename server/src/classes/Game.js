// Data
import VALID_WORDS from "../data/validWords.js"
import WORDLE_ANSWERS from "../data/wordleAnswers.js"

import { getUser } from "../services/userService.js"

export default class Game {
  constructor() {
    this.solution = null
    this.startingWord = null
    this.allUserInfo = new Map()
    this.countSolved = 0
    this.countOutOfGuesses = 0
    this.round = 0
  }

  static async createGame(users, prevPoints, prevRound, isChallengeMode) {
    const game = new Game()

    game.solution = game.generateSolution()
    game.startingWord = isChallengeMode
      ? game.generateRandomFirstGuess(game.solution)
      : null
    game.allUserInfo = await game.initializeAllUserInfo(users, prevPoints)
    game.countSolved = 0
    game.countOutOfGuesses = 0
    game.round = prevRound + 1

    return game
  }

  async initializeAllUserInfo(users, prevPoints) {
    const allUserInfoMap = new Map()

    await Promise.all(
      users.map(async (userId) => {
        const user = await getUser(userId)
        if (user) {
          allUserInfoMap.set(userId, {
            username: user.username,
            gameBoard: new Array(6)
              .fill()
              .map(() => new Array(5).fill({ letter: "", color: "" })),
            streak: user.currStreak,
            points: prevPoints.get(userId) || 0,
          })
        }
      })
    )

    return allUserInfoMap
  }

  roomSize() {
    return this.allUserInfo.size
  }

  getGameBoard(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      return userInfo.gameBoard
    }
    return []
  }

  setGameBoard(userId, gameBoard) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      userInfo.gameBoard = gameBoard
    }
  }

  getPoints(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      return userInfo.points
    }
  }

  getAllPoints() {
    const pointsMapping = new Map()
    this.allUserInfo.forEach((userInfo, userId) => {
      pointsMapping.set(userId, userInfo.points)
    })

    return pointsMapping
  }

  updatePoints(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      const newPoints = this.roomSize() - this.countSolved
      userInfo.points += newPoints
    }
  }

  getStreak(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      return userInfo.streak
    }
  }

  incrementStreak(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      userInfo.streak += 1
    }
  }

  resetStreak(userId) {
    const userInfo = this.allUserInfo.get(userId)
    if (userInfo) {
      userInfo.streak = 0
    }
  }

  updateStreaks(winnerUserId) {
    this.allUserInfo.forEach((userInfo, userId) => {
      if (userId === winnerUserId) {
        this.incrementStreak(userId)
      } else {
        this.resetStreak(userId)
      }
    })
  }

  getAllUserInfo() {
    return Array.from(this.allUserInfo.entries()).map(([userId, userInfo]) => {
      const userInfoEntry = { userId }

      for (const [key, value] of Object.entries(userInfo)) {
        userInfoEntry[key] = value
      }

      return userInfoEntry
    })
  }

  generateSolution() {
    const newSolution =
      WORDLE_ANSWERS[
        Math.floor(Math.random() * WORDLE_ANSWERS.length)
      ].toUpperCase()
    console.log("Solution is", newSolution)
    return newSolution
  }

  // Used for challenge mode, generates a random starting word that always has exactly one letter in the correct spot
  generateRandomFirstGuess(solution) {
    let randomFirstGuess
    while (true) {
      randomFirstGuess =
        VALID_WORDS[
          Math.floor(Math.random() * VALID_WORDS.length)
        ].toUpperCase()
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

  // Emitting methods
  startGame(roomId, io) {
    io.to(roomId).emit(
      "gameStarted",
      this.getAllUserInfo(),
      this.solution,
      this.startingWord,
      this.round
    )
  }

  broadcastNoLetterGameBoard(roomId, userId, io) {
    if (roomId) {
      const noLettersBoard = this.getGameBoard(userId).map((row) =>
        row.map((cell) => ({ ...cell, letter: "" }))
      )
      io.to(roomId).emit("gameBoardsUpdated", userId, noLettersBoard)
    } else {
      console.error("Invalid roomId for broadcasting game board")
    }
  }

  broadcastPoints(roomId, userId, io) {
    if (roomId) {
      io.to(roomId).emit("pointsUpdated", userId, this.getPoints(userId))
    } else {
      console.error("Invalid roomId for broadcasting points")
    }
  }

  broadcastStreak(roomId, userId, io) {
    if (roomId) {
      io.to(roomId).emit("streakUpdated", userId, this.getStreak(userId))
    } else {
      console.error("Invalid roomId for broadcasting streak")
    }
  }

  broadcastFinalUserInfo(roomId, io) {
    if (roomId) {
      io.to(roomId).emit("finalUserInfo", this.getAllUserInfo())
    } else {
      console.error("Invalid roomId for broadcasting final user info")
    }
  }
}
