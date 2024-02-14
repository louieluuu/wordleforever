// Data
import VALID_WORDS from "../data/validWords.js"
import WORDLE_ANSWERS from "../data/wordleAnswers.js"
import {
  handleGameStart,
  handleBatchDbUpdate,
} from "../services/gameService.js"

// Services
import { setRoomOutOfGame } from "../services/roomService.js"

// These are all in seconds
// Mess around with these for testing, but always return them to the following unless permanently changing:
// const PRIVATE_GAME_TIMER = 120
// const PRIVATE_GAME_SOLVED_TIMER = 45
// const ROUND_BREAK_TIME = 7.5

// const PRIVATE_ROUND_LIMIT = 10

const PRIVATE_GAME_TIMER = 5
const PRIVATE_GAME_SOLVED_TIMER = 45
const ROUND_BREAK_TIME = 7.5

const PRIVATE_ROUND_LIMIT = 2

export default class Game {
  constructor() {
    this.connectionMode = null
    this.gameMode = null
    this.solution = null
    this.startingWord = null
    this.gameUserInfo = new Map()
    this.winnerId = null
    this.countSolved = 0
    this.countOutOfGuesses = 0
    this.round = 0
    this.roundLimit = 0
    this.reachedRoundLimit = false
    this.timer = 0
    this.timerId = null
    this.elapsedTime = 0
    this.elapsedTimerId = null
    this.hasUpdatedInDbList = []
  }

  static createGame(
    connectionMode,
    gameMode,
    roomUserInfo,
    prevPoints,
    prevRound,
    prevRoundsWon,
    prevSolveDistribution,
    prevTotalSolveTime,
    prevTotalGuesses,
    prevTotalOutOfGuesses
  ) {
    const game = new Game()

    game.connectionMode = connectionMode
    game.gameMode = gameMode
    game.solution = game.generateSolution()
    game.startingWord =
      gameMode === "challenge"
        ? game.generateRandomFirstGuess(game.solution)
        : null
    game.gameUserInfo = game.initializeGameUserInfo(
      roomUserInfo,
      prevPoints,
      prevRoundsWon,
      prevSolveDistribution,
      prevTotalSolveTime,
      prevTotalGuesses,
      prevTotalOutOfGuesses
    )
    game.countSolved = 0
    game.countOutOfGuesses = 0
    game.round = prevRound + 1
    game.roundLimit = connectionMode === "public" ? 1 : PRIVATE_ROUND_LIMIT
    game.reachedRoundLimit = false
    game.timer = connectionMode === "public" ? Infinity : PRIVATE_GAME_TIMER
    game.hasUpdatedInDbList = []

    return game
  }

  initializeGameUserInfo(
    roomUserInfo,
    prevPoints,
    prevRoundsWon,
    prevSolveDistribution,
    prevTotalSolveTime,
    prevTotalGuesses,
    prevTotalOutOfGuesses
  ) {
    const gameUserInfoMap = new Map()

    roomUserInfo.forEach((user, userId) => {
      gameUserInfoMap.set(userId, {
        displayName: user.displayName,
        gameBoard: new Array(6)
          .fill()
          .map(() => new Array(5).fill({ letter: "", color: "" })),
        streak: user.currStreak,
        points: prevPoints.get(userId) || 0,
        roundsWon: prevRoundsWon.get(userId) || 0,
        solveDistribution: prevSolveDistribution.get(userId) || [
          0, 0, 0, 0, 0, 0,
        ],
        totalSolveTime: prevTotalSolveTime.get(userId) || 0,
        totalGuesses: prevTotalGuesses.get(userId) || 0,
        totalOutOfGuesses: prevTotalOutOfGuesses.get(userId) || 0,
      })
    })

    return gameUserInfoMap
  }

  getUserIds() {
    return Array.from(this.gameUserInfo.keys())
  }

  getRoomSize() {
    return this.gameUserInfo.size
  }

  getGameBoard(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.gameBoard
    }
    return []
  }

  setGameBoard(userId, gameBoard) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.gameBoard = gameBoard
    }
  }

  setWinner(userId) {
    // Guarantees only one winner.
    if (this.winnerId === null) {
      this.winnerId = userId
    }
  }

  getAllRoundsWon() {
    const allRoundsWonMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      allRoundsWonMapping.set(userId, userInfo.roundsWon)
    })

    return allRoundsWonMapping
  }

  getRoundsWon(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.roundsWon
    }
  }

  incrementRoundsWon(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.roundsWon += 1
      console.log("From incrementRoundsWon:")
      console.log(`roundsWon: ${userInfo.roundsWon}`)
    }
  }

  getAllTotalSolveTime() {
    const allTotalSolveTimeMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      allTotalSolveTimeMapping.set(userId, userInfo.totalSolveTime)
    })

    return allTotalSolveTimeMapping
  }

  getTotalSolveTime(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.totalSolveTime
    }
  }

  incrementTotalSolveTime(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.totalSolveTime += this.elapsedTime
    }
  }

  getAllSolveDistribution() {
    const allSolveDistributionMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      allSolveDistributionMapping.set(userId, userInfo.solveDistribution)
    })

    return allSolveDistributionMapping
  }

  getSolveDistribution(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.solveDistribution
    }
  }

  updateSolveDistribution(userId, correctGuessIndex) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.solveDistribution[correctGuessIndex] += 1
    }
  }

  getAllTotalGuesses() {
    const allTotalGuessesMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      allTotalGuessesMapping.set(userId, userInfo.totalGuesses)
    })

    return allTotalGuessesMapping
  }

  getTotalGuesses(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.totalGuesses
    }
  }

  incrementTotalGuesses(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.totalGuesses += 1
    }
  }

  getAllTotalOutOfGuesses() {
    const allTotalOutOfGuessesMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      allTotalOutOfGuessesMapping.set(userId, userInfo.totalOutOfGuesses)
    })

    return allTotalOutOfGuessesMapping
  }

  getTotalOutOfGuesses(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.totalOutOfGuesses
    }
  }

  incrementTotalOutOfGuesses(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.totalOutOfGuesses += 1
    }
  }

  getStreak(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.streak
    }
  }

  incrementStreak(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.streak += 1
    }
  }

  resetStreak(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      userInfo.streak = 0
    }
  }

  updateStreaks(winnerId) {
    this.gameUserInfo.forEach((_, userId) => {
      if (userId === winnerId) {
        this.incrementStreak(userId)
      } else {
        this.resetStreak(userId)
      }
    })
  }

  getPoints(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.points
    }
  }

  getAllPoints() {
    const pointsMapping = new Map()
    this.gameUserInfo.forEach((userInfo, userId) => {
      pointsMapping.set(userId, userInfo.points)
    })

    return pointsMapping
  }

  updatePoints(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      if (this.countSolved === 1 && this.timer > PRIVATE_GAME_SOLVED_TIMER) {
        userInfo.points += PRIVATE_GAME_SOLVED_TIMER * 2
      } else {
        userInfo.points += this.timer
      }
    }
  }

  setSolvedTimer(roomId, io) {
    if (this.timer > PRIVATE_GAME_SOLVED_TIMER) {
      this.timer = PRIVATE_GAME_SOLVED_TIMER
      this.resyncTimer(roomId, io)
    }
  }

  // For socket transmission (socket.IO doesn't transmit Maps).
  getGameUserInfoArray() {
    return Array.from(this.gameUserInfo.entries()).map(([userId, userInfo]) => {
      const userInfoEntry = { userId }

      for (const [key, value] of Object.entries(userInfo)) {
        userInfoEntry[key] = value
      }

      return userInfoEntry
    })
  }

  isWinner(userId) {
    return this.winnerId === userId
  }

  generateSolution() {
    const newSolution =
      WORDLE_ANSWERS[
        Math.floor(Math.random() * WORDLE_ANSWERS.length)
      ].toUpperCase()
    console.log(`Solution is: ${newSolution}`)
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
      this.getGameUserInfoArray(),
      this.solution,
      this.startingWord,
      PRIVATE_ROUND_LIMIT,
      this.round,
      this.timer
    )
    // Wait for the in game countdown to finish
    setTimeout(() => {
      if (this.connectionMode === "private") {
        this.startTimer(roomId, io)
      }
      this.startElapsedTime()
    }, 3000)
  }

  isGameOver() {
    if (this.connectionMode === "private") {
      if (this.countSolved + this.countOutOfGuesses >= this.getRoomSize()) {
        return true
      }
    } else if (this.connectionMode === "public") {
      if (
        this.countSolved > 0 ||
        this.countOutOfGuesses >= this.getRoomSize()
      ) {
        return true
      }
    }
    return false
  }

  isMatchOver() {
    return this.reachedRoundLimit
  }

  endGame(roomId, io) {
    if (this.round >= this.roundLimit) {
      this.reachedRoundLimit = true
    }
    clearInterval(this.timerId)
    clearInterval(this.elapsedTimerId)
    this.broadcastEndOfGameInfo(roomId, io)
    if (this.connectionMode === "private") {
      setRoomOutOfGame(roomId)
      if (!this.reachedRoundLimit) {
        this.startNextRoundAfterBreak(roomId, io)
      }
    }
  }

  startElapsedTime() {
    this.elapsedTimerId = setInterval(() => {
      this.elapsedTime++
    }, 1000)
  }

  startTimer(roomId, io) {
    io.to(roomId).emit("timerTick", this.timer)
    this.timerId = setInterval(() => {
      this.timer--
      io.to(roomId).emit("timerTick", this.timer)

      if (this.timer <= 0) {
        this.endGame(roomId, io)
        if (this.isMatchOver()) {
          handleBatchDbUpdate(this)
        }
      }
    }, 1000)
  }

  resyncTimer(roomId, io) {
    this.cleanupTimer()
    this.startTimer(roomId, io)
  }

  startNextRoundAfterBreak(roomId, io) {
    setTimeout(() => {
      handleGameStart(roomId, io)
    }, ROUND_BREAK_TIME * 1000)
  }

  broadcastSpectatorInfo(socket) {
    socket.emit(
      "spectatorInfo",
      this.getGameUserInfoArray(),
      this.roundLimit,
      this.round,
      this.timer
    )
  }

  /* Commenting this out for spectators to be able to receive the full game boards, not necessarily sure how I feel about always sending this information to client and having them do the processing */
  // broadcastNoLetterGameBoard(roomId, userId, io) {
  //   if (roomId) {
  //     const noLettersBoard = this.getGameBoard(userId).map((row) =>
  //       row.map((cell) => ({ ...cell, letter: "" }))
  //     )
  //     io.to(roomId).emit("gameBoardsUpdated", userId, noLettersBoard)
  //   } else {
  //     console.error("Invalid roomId for broadcasting game board")
  //   }
  // }

  broadcastGameBoard(roomId, userId, io) {
    if (roomId) {
      io.to(roomId).emit("gameBoardsUpdated", userId, this.getGameBoard(userId))
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

  broadcastFirstSolve(roomId, userId, io) {
    if (roomId) {
      io.to(roomId).emit("firstSolve", userId)
    } else {
      console.error("Invalid roomId for broadcasting first solve")
    }
  }

  broadcastSolvedAudio(roomId, socket) {
    if (roomId) {
      socket.to(roomId).emit("opponentSolvedAudio")
    } else {
      console.error("Invalid roomId for broadcasting solve audio")
    }
  }

  broadcastEndOfGameInfo(roomId, io) {
    if (roomId) {
      io.to(roomId).emit(
        "endOfGameInfo",
        this.getGameUserInfoArray(),
        this.isMatchOver()
      )
    } else {
      console.error("Invalid roomId for broadcasting end of game info")
    }
  }

  broadcastEndOfMatch(roomId, io) {
    if (roomId) {
      io.to(roomId).emit("endOfMatch")
    } else {
      console.error("Invalid roomId for broadcasting end of match")
    }
  }

  cleanupTimer() {
    clearInterval(this.timerId)
    delete this.timerId
  }
}
