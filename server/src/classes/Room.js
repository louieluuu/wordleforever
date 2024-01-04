export default class Room {
    constructor(connectionMode, gameMode) {
        this.connectionMode = connectionMode
        this.gameMode = gameMode
        this.users = []
        this.inGame = false
        this.countdownStarted = false
    }
}