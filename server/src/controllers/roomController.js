import { v4 as uuidv4 } from 'uuid';

// Services
import { initializeGameBoard } from '../services/gameService.js';
import { getRoomsFromConnection, roomExists } from '../services/roomService.js';
import { setUsername } from '../services/userService.js';

function createRoom(connectionMode, socket) {
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
    initializeGameBoard(roomId, socket, io)
  }
}

function startRoom(roomId, socket, io) {
  if (roomExists(roomId, socket)) {
    io.to(roomId).emit('roomStarted')
  }
}

export { createRoom, joinRoom, startRoom }