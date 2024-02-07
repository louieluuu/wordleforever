export default class Guest {
  constructor(socketId) {
    this.userId = socketId
    this.displayName = ""

    this.currStreak = 0
    this.maxStreak = 0
    this.totalGames = 0
    this.totalWins = 0
    this.totalGuesses = 0
    this.totalTimeInGamesWon = 0
  }
}
