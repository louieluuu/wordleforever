import mongoose from 'mongoose'
import { User, Room, Game } from './models.js'

async function cleanupDatabase() {
    try {
        await User.deleteMany({})
        await Room.deleteMany({})
        await Game.deleteMany({})
        console.log('Database cleanup successful')
    } catch (error) {
        console.log(`Error cleaning up database: ${error.message}`)
    }
}

mongoose.connect('mongodb://localhost:27017/wordle_database')

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', async () => {
    console.log('Connected to MongoDB')
    await cleanupDatabase()
})

export { mongoose, cleanupDatabase }