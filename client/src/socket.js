import { io } from "socket.io-client"

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_EC2_URL
    : `http://${import.meta.env.VITE_IP_ADDR}:3005`

const socket = io(SERVER_URL, { transports: ["websocket"] })

export default socket
