import { mongoose } from "./db.js"

const UserSchema = new mongoose.Schema({
    userId: String,
    username: String,
    gameBoard: {
      type: [[{ letter: { type: String, default: '' }, color: { type: String, default: '' } }]],
      default: new Array(6).fill().map(() => new Array(5).fill({ letter: '', color: '' })),
    },
})

const RoomSchema = new mongoose.Schema({
    roomId: String,
    connectionMode: String,
    gameMode: String,
    hostUserId: String,
    users: [String],
    inGame: { type: Boolean, default: false },
    countdownStarted: { type: Boolean, default: false },
})

const GameSchema = new mongoose.Schema({
    roomId: String,
    solution: String,
    startingWord: String,
    users: [String],
    countGameOvers: { type: Number, default: 0 },
    countOutOfGuesses: { type: Number, default: 0 },
})

const User = mongoose.model('User', UserSchema)
const Room = mongoose.model('Room', RoomSchema)
const Game = mongoose.model('Game', GameSchema)

export { User, Room, Game }