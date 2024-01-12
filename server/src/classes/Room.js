export default class Room {
  constructor(connectionMode, isChallengeOn, userId) {
    this.connectionMode = connectionMode
    this.isChallengeOn = isChallengeOn
    this.hostUserId = userId
    this.users = []
    this.inGame = false
    this.countdownStarted = false
  }
}
