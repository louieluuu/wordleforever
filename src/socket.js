import { io } from "socket.io-client"

// "undefined" means the URL will be computed from the `window.location` object
// the second ternary option must match the server's index.js
const URL = process.env.NODE_ENV === "production" ? undefined : "localhost:4000"

export const socket = io(URL, {
  transports: ["websocket"], // required when using Vite
  // autoConnect: false,
})
