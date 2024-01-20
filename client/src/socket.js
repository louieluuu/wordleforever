import { io } from "socket.io-client"

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_EC2_URL
    : "http://localhost:3005"

const socket = io(SERVER_URL, { transports: ["websocket"] })

socket.on("connect", () => {
  console.log("Connected to server")
})

socket.on("disconnect", () => {
  console.log("Disconnected from server")
})

export default socket
