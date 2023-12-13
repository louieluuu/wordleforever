import { v4 as uuidv4 } from 'uuid';

// Services
import { getRoomsFromConnection, getRoomsFromId, roomExists } from '../services/roomService.js';
import { setUsername, broadcastUserInfo } from '../services/userService.js';

function createRoom(connectionMode, io, socket) {
  const roomId = uuidv4();
  const rooms = getRoomsFromConnection(connectionMode);

  rooms.set(roomId, {
    UserInfo: new Map(),
  });

  console.log(`Creating room: ${roomId}`);
  socket.emit('roomCreated', roomId);
}

function joinRoom(roomId, username, io, socket) {
  if (roomExists(roomId, socket)) {
    console.log(`${socket.id} joining room: ${roomId}`)
    socket.join(roomId)

    setUsername(roomId, username, io, socket)
  }
}

export { createRoom, joinRoom }