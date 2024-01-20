import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGO_DB_USER = process.env.MONGO_DB_USER
const MONGO_DB_PW = process.env.MONGO_DB_PW

const localhost = "mongodb://localhost:27017/wordle_database"
const mongodbUrl = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PW}@cluster0.havy6yc.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(mongodbUrl)

const db = mongoose.connection

db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", async () => {
  console.log("Connected to MongoDB")
})

export { mongoose }
