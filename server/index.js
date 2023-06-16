const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173/",
  },
})

io.on("connection", (socket) => {
  // 20-character identifier
  console.log(`socket.id: ${socket.id}`)

  // io.engine is the underlying thing, you can maybe think of it as metadata-y
  // Fetch the number of clients using io.engine
  const count = io.engine.clientsCount
  console.log(`count: ${count}`)

  // https://socket.io/docs/v4/server-instance/#utility-methods
  // here are some room methods like socketsJoin, socketsLeave which might come in handy later

  // middleware = a function that gets executed for every incoming connection (middle man)
  // -useful for logging, authentication, ...
  // io.use((socket, next))
})

httpServer.listen(5173)
