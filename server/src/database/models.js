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
    currStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalGuesses: { type: Number, default: 0 },
    totalTimeInGamesWon: { type: Number, default: 0 },
})

const User = mongoose.model('User', UserSchema)

export { User }