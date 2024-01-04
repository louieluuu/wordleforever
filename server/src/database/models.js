import { mongoose } from './db.js'

// Store stats for each user
// Max streak
// Current streak
// Win percentage (total games, total wins)
// Avg number of guesses (total guesses)
// Avg solve time (total time in game, check if won)

// User
// ID, max streak, curr streak, total games, total wins, total guesses, total time in games won, points

const UserSchema = new mongoose.Schema({
    userId: String,
    username: String,
    gameBoard: {
      type: [[{ letter: { type: String, default: '' }, color: { type: String, default: '' } }]],
      default: new Array(6).fill().map(() => new Array(5).fill({ letter: '', color: '' })),
    },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
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
const Game = mongoose.model('Game', GameSchema)

export { User, Game }