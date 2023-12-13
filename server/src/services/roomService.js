const Private = new Map()
const Public = new Map()
const Rooms = { Private, Public }

function getRoomsFromConnection(mode) {
  if (mode === 'online-private') {
    return Rooms.Private
  } else if (mode === 'online-public') {
    return Rooms.Public
  } else {
    return undefined
  }
}

function getRoomsFromId(roomId) {
  if (Rooms.Private.has(roomId)) {
    return Rooms.Private
  } else if (Rooms.Public.has(roomId)) {
    return Rooms.Public
  } else {
    return undefined
  }
}

function roomExists(roomId, socket) {
    const rooms = getRoomsFromId(roomId)

    // Check if room exists
    if (rooms === undefined) {
      const errorMessage = "This room does not exist."
      socket.emit("roomError", errorMessage)
      return false
    }

    return true
}

export { getRoomsFromConnection, getRoomsFromId, roomExists }