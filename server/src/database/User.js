import { mongoose } from "./db.js"

// Store stats for each user
// Max streak
// Current streak
// Win percentage (total games, total wins)
// Avg number of guesses (total guesses)
// Avg solve time (total time in game, check if won)

// User
// ID, max streak, curr streak, total games, total wins, total guesses, total time in games won, points

const UserSchema = new mongoose.Schema({
  // Special property that is automatically indexed by MongoDB,
  // resulting in faster queries by using findById().
  // During user creation, _id is set to the Firebase user's (unique) uid.
  // MongoDB normally expects a specific hex string type for _id.
  // But by specifying the type as String, we can bypass this restriction and use the Firebase uid directly.
  _id: String,

  userId: String,
  currStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  totalGames: {
    public: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    private: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
  },
  totalWins: {
    public: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    private: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
  },
  totalSolveTime: {
    public: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    private: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
  },
  guessDistribution: {
    public: {
      normal: [Number],
      challenge: [Number],
    },
    private: {
      normal: [Number],
      challenge: [Number],
    },
  },
})

export default mongoose.model("User", UserSchema)
