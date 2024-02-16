import mongoose from "./db.js"
const { Schema, model } = mongoose

const statsSchema = new Schema({
  streak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  solveDistribution: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
  totalSolveTime: { type: Number, default: 0 },
  totalGuesses: { type: Number, default: 0 },
  totalOOG: { type: Number, default: 0 },
})

const userSchema = new Schema({
  // During user creation, _id is set to the (unique) Firebase uid so we have a 1:1 mapping between a Firebase account and a MongoDB document. We must explicitly set the _id type to String to allow this.
  _id: String,
  username: String,

  public: {
    normal: statsSchema,
    challenge: statsSchema,
  },
  private: {
    normal: statsSchema,
    challenge: statsSchema,
  },
})

export default model("User", userSchema)
