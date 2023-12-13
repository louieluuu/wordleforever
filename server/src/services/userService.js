import { getRoomsFromId } from "./roomService.js"

function setUsername(roomId, username, io, socket) {
    const rooms = getRoomsFromId(roomId)

    const currUserInfo = rooms.get(roomId).UserInfo
    currUserInfo.set(socket.id, {
        username: username,
    })

    broadcastUserInfo(currUserInfo, roomId, io)
}

function broadcastUserInfo(userInfo, roomId, io) {
    const userInfoArray = Array.from(userInfo.entries(), ([socketId, info]) => ({
        socketId: socketId,
        username: info.username,
    }))
    io.to(roomId).emit("userInfoUpdated", userInfoArray)
}

function removeUser(socket, io) {
    const roomId = Array.from(socket.rooms)[1]

    if (roomId === undefined) {
      console.log(`User ${socket.id} disconnected without connecting to a room`)
    } else {
      const rooms = getRoomsFromId(roomId)
      const currUserInfo = rooms.get(roomId).UserInfo
      console.log(`Removing user ${socket.id} from ${roomId}`)
      currUserInfo.delete(socket.id)
      broadcastUserInfo(currUserInfo, roomId, io)
    }

    console.log(`User ${socket.id} disconnected`)
}

export { setUsername, broadcastUserInfo, removeUser }