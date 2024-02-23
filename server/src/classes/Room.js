// Room contains some configuration settings for the game, since they need to be displayed + be editable in the waiting room in a private game
// Default configuration settings here will be those set for a public game, the configurations for a private game will be emitted and updated separately within roomService

const MAX_ROOM_SIZE = 7

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

    this.maxPlayers = MAX_ROOM_SIZE
    this.roundLimit = 1
    this.roundTime = Infinity
    this.dynamicTimerOn = true
    this.letterEliminationOn = true
  }
}
