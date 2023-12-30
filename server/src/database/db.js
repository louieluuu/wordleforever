import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/wordle_database')

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
    console.log('Connected to MongoDB')
})

export { mongoose }