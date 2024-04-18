// Data
import VALID_WORDS from "../data/validWords.js"
import WORDLE_ANSWERS from "../data/wordleAnswers.js"
import {
  handleGameStart,
  handleBatchDbUpdate,
} from "../services/gameService.js"

// Services
import { setRoomOutOfGame } from "../services/roomService.js"

const ROUND_BREAK_TIME = 7.5 // RESET TO 7.5

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
    this.solvedTimer = 0
    this.elapsedTime = 0
    this.elapsedTimerId = null
  }

  static createGame(
    roomConfiguration,
    roomUserInfo,
    prevRound,
    prevGameUserInfo
  ) {
    const game = new Game()

    game.connectionMode = roomConfiguration.connectionMode
    game.gameMode = roomConfiguration.gameMode
    game.solution = game.generateSolution()
    game.startingWord =
      game.gameMode === "challenge"
        ? game.generateRandomFirstGuess(game.solution)
        : null
    game.gameUserInfo = game.initializeGameUserInfo(
      roomUserInfo,
      prevGameUserInfo
    )
    game.countSolved = 0
    game.countOutOfGuesses = 0
    game.round = prevRound + 1
    game.roundLimit = roomConfiguration.roundLimit
    game.reachedRoundLimit = false
    game.timer = roomConfiguration.roundTime
    // Not sure if this is the best formula, but this needed to be changed since round time can be set
    // Default public game round time = 150, 150 / 5 * 2 = 60 seconds solved timer
    // Always rounds up to the next multiple of 5
    // Ex: round time of 120, 120 / 5 * 2 is 48
    // 48 / 5 = 9.6, the ceiling of which is 10, then multiply back by 5 to get 50
    game.solvedTimer = Math.ceil(((game.timer / 5) * 2) / 5) * 5
    game.isDynamicTimerOn = roomConfiguration.isDynamicTimerOn
    game.hasUpdatedInDbList = []

    return game
  }

  initializeGameUserInfo(roomUserInfo, prevGameUserInfo) {
    const gameUserInfoMap = new Map()

    roomUserInfo.forEach((user, userId) => {
      gameUserInfoMap.set(userId, {
        displayName: user.displayName,
        gameBoard: new Array(6)
          .fill()
          .map(() => new Array(5).fill({ letter: "", color: "" })),
        streak: user.currStreak,
        points: prevGameUserInfo.get(userId)?.points || 0,
        roundsPlayed: prevGameUserInfo.get(userId)?.roundsPlayed + 1 || 1,
        roundsWon: prevGameUserInfo.get(userId)?.roundsWon || 0,
        solveDistribution: prevGameUserInfo.get(userId)?.solveDistribution || [
          0, 0, 0, 0, 0, 0,
        ],
        totalSolveTime: prevGameUserInfo.get(userId)?.totalSolveTime || 0,
        totalGuesses: prevGameUserInfo.get(userId)?.totalGuesses || 0,
        totalOutOfGuesses: prevGameUserInfo.get(userId)?.totalOutOfGuesses || 0,
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

  getRoundsPlayed(userId) {
    const userInfo = this.gameUserInfo.get(userId)
    if (userInfo) {
      return userInfo.roundsPlayed
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
      if (this.isDynamicTimerOn) {
        if (this.countSolved === 1 && this.timer > this.solvedTimer) {
          userInfo.points += this.solvedTimer * 2
        } else {
          userInfo.points += this.timer
        }
      } else {
        if (this.countSolved === 1) {
          userInfo.points += this.timer * 2
        } else {
          userInfo.points += this.timer
        }
      }
    }
  }

  setSolvedTimer(roomId, io) {
    if (this.timer > this.solvedTimer) {
      this.timer = this.solvedTimer
      this.resyncTimer(roomId, io)
    }
  }

  // For socket transmission (socket.IO doesn't transmit Maps).
  getGameUserInfoAsArray() {
    return Array.from(this.gameUserInfo.entries()).map(([userId, userInfo]) => {
      const userInfoEntry = { userId }

      for (const [key, value] of Object.entries(userInfo)) {
        userInfoEntry[key] = value
      }

      return userInfoEntry
    })
  }

  getMatchWinnerId() {
    const pointsMap = this.getAllPoints()
    let matchWinnerId = null
    let maxPoints = -1

    pointsMap.forEach((points, userId) => {
      if (points > maxPoints) {
        maxPoints = points
        matchWinnerId = userId
      }
    })

    console.log(`Match winner is: ${matchWinnerId}`)

    return matchWinnerId
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
      this.getGameUserInfoAsArray(),
      this.solution,
      this.startingWord,
      this.roundLimit,
      this.round,
      this.timer,
      this.solvedTimer
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
    if (this.countSolved + this.countOutOfGuesses >= this.getRoomSize()) {
      return true
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
      this.elapsedTime += 1
    }, 1000)
  }

  startTimer(roomId, io) {
    io.to(roomId).emit("timerTick", this.timer)
    this.timerId = setInterval(() => {
      this.timer -= 1
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
      this.getGameUserInfoAsArray(),
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
        this.getGameUserInfoAsArray(),
        this.isMatchOver()
      )
    } else {
      console.error("Invalid roomId for broadcasting end of game info")
    }
  }

  // TODO: Not being used.
  // broadcastEndOfMatch(roomId, io) {
  //   if (roomId) {
  //     io.to(roomId).emit("endOfMatch")
  //   } else {
  //     console.error("Invalid roomId for broadcasting end of match")
  //   }
  // }

  cleanupTimer() {
    clearInterval(this.timerId)
    delete this.timerId
  }
}
