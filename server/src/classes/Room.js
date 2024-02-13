export default class Room {
  constructor(connectionMode, gameMode, userId) {
    this.connectionMode = connectionMode
    this.gameMode = gameMode
    this.hostUserId = userId

    this.userInfo = new Map()
    this.loadedUsers = []

    // inGame switches between true and false in private rooms on each game completion
    // inProgress indicates whether a room has progressed past the waiting room (necessary for joining a private room late)
    this.inGame = false
    this.inProgress = false

    this.countdownStarted = false
  }
}
