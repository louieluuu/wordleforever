export default class Room {
  constructor(connectionMode, isChallengeOn) {
    this.connectionMode = connectionMode
    this.isChallengeOn = isChallengeOn
    this.users = []
    this.inGame = false
    this.countdownStarted = false
  }
}
