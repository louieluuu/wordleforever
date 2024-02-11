import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./User.js"

// import.meta.env doesn't work in Node.js
dotenv.config()

async function cleanupDatabase() {
  try {
    await User.deleteMany({})
    console.log("Database wiped clean.")
  } catch (error) {
    console.error(`Error cleaning up database: ${error.message}`)
    throw error
  }
}

const MONGO_DB_USER = process.env.MONGO_DB_USER
const MONGO_DB_PW = process.env.MONGO_DB_PW

const mongodbFree = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PW}@cluster0.havy6yc.mongodb.net/?retryWrites=true&w=majority`
const mongodbPaid = ``

const mongodbUrl =
  process.env.NODE_ENV === "production" ? mongodbPaid : mongodbFree

mongoose.connect(mongodbUrl)

const db = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", async () => {
  console.log("Connected to MongoDB")
  // await cleanupDatabase()
})

export { mongoose } // TODO: Wait, is this actually a thing?
