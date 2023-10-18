import { io } from "socket.io-client"

const URL = process.env.NODE_ENV === "production" ? import.meta.env.VITE_EC2_URL : "localhost:3005"

console.log(import.meta.env.VITE_EC2_URL)

export const socket = io(URL, {
  transports: ["websocket"], // "websocket" required when using Vite
  // autoConnect: false,
})
