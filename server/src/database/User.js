import mongoose from "./db.js"
const { Schema, model } = mongoose

const publicStatsSchema = new Schema(
  {
    currStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    solveDistribution: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
    totalSolveTime: { type: Number, default: 0 },
    totalGuesses: { type: Number, default: 0 },
    totalOOG: { type: Number, default: 0 },
  },
  { _id: false }
)

const privateStatsSchema = new Schema(
  {
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    solveDistribution: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
    totalSolveTime: { type: Number, default: 0 },
    totalGuesses: { type: Number, default: 0 },
    totalOOG: { type: Number, default: 0 },
  },
  { _id: false }
)

const userSchema = new Schema({
  // During user creation, _id is set to the (unique) Firebase uid so we have a 1:1 mapping between a Firebase account and a MongoDB document. We must explicitly set the _id type to String to allow this.
  _id: String,
  username: String,

  // Stats
  stats: {
    public: {
      normal: { type: publicStatsSchema, default: {} },
      challenge: { type: publicStatsSchema, default: {} },
    },
    private: {
      normal: { type: privateStatsSchema, default: {} },
      challenge: { type: privateStatsSchema, default: {} },
    },
  },
})

export default model("User", userSchema)
