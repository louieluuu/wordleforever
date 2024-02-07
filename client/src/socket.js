import { io } from "socket.io-client"

import { auth } from "./firebase"

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_EC2_URL
    : `http://${import.meta.env.VITE_IP_ADDR}:3005`

const socket = io(SERVER_URL, { transports: ["websocket"] })

socket.on("connect", () => {
  console.log(`Connected to server with socketId: ${socket.id}`)

  socket.randomId = 123

  // Using the native Firebase method instead of the react-firebase-hook.
  // Hooks can only be used in function components, which would require
  // turning socket.js into an empty-render Socket component.
  auth.onAuthStateChanged((user) => {
    const userId = user ? user.uid : null

    if (userId) {
      console.log(`Auth successful with userId: ${userId}`)
    } else {
      console.log("No auth")
    }

    socket.emit("newConnection", userId)
  })
})

socket.on("disconnect", () => {
  console.log("Disconnected from server")
})

export default socket
