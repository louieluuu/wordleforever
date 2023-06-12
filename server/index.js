const io = require("socket.io")(server)

io.on("connection", (socket) => {
  console.log("Player connected")

  socket.on("disconnect", () => {
    console.log("Player disconnected")
  })
})
