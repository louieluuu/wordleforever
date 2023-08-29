import { io } from "socket.io-client"

// TODO: ec2 might have to start with https:// or ws:// or wss://, check later
// TODO: (Someone recommended ws://)
const URL =
  process.env.NODE_ENV === "production"
    ? "ec2-18-236-100-196.us-west-2.compute.amazonaws.com"
    : "localhost:4000"

export const socket = io(URL, {
  transports: ["websocket"], // required when using Vite
  // autoConnect: false,
})
