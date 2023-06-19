import { io } from "socket.io-client"

// "undefined" means the URL will be computed from the `window.location` object
// localhost:4000 has to be the same as the server port
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000"

export const socket = io(URL, {
  transports: ["websocket"], // required when using Vite
})
