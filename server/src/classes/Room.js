// Default game configuration
// Most were originally in Game class, moved here due to configuration in WaitingRoom (no Game object created yet)
const MAX_ROOM_SIZE = 7
const DEFAULT_PRIVATE_ROUND_LIMIT = 5 // RESET TO 5
const DEFAULT_PRIVATE_ROUND_TIME = 150 // RESET TO 150

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
    this.roundLimit =
      connectionMode === "public" ? 1 : DEFAULT_PRIVATE_ROUND_LIMIT
    this.roundTime =
      connectionMode === "public" ? Infinity : DEFAULT_PRIVATE_ROUND_TIME
    this.dynamicTimerOn = true
    this.letterEliminationOn = true
  }
}
