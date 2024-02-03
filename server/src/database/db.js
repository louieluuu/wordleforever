import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

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
})

export { mongoose }
