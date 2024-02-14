import { mongoose } from "./db.js"

const UserSchema = new mongoose.Schema({
  // Special property that is automatically indexed by MongoDB,
  // resulting in faster queries by using findById().
  // During user creation, _id is set to the Firebase user's (unique) uid.
  // MongoDB normally expects a specific hex string type for _id.
  // But by specifying the type as String, we can bypass this restriction and use the Firebase uid directly.
  _id: String,

  username: String,
  currStreak: {
    normal: { type: Number, default: 0 },
    challenge: { type: Number, default: 0 },
  },
  maxStreak: {
    normal: { type: Number, default: 0 },
    challenge: { type: Number, default: 0 },
  },
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
  solveDistribution: {
    public: {
      normal: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
      challenge: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
    },
    private: {
      normal: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
      challenge: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
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
  totalGuesses: {
    public: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    private: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
  },
  totalOutOfGuesses: {
    public: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    private: {
      normal: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
  },
})

export default mongoose.model("User", UserSchema)
