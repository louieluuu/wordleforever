// Database models
import User from "../database/User.js"

// Classes
import Room from "../classes/Room.js"
import Guest from "../classes/Guest.js"

// Services
import {
  getRoom,
  getRoomUserInfo,
  roomInLobby,
  isUserInRoom,
  deleteRoom,
  removeUserFromRoom,
  isRoomEmpty,
  isHostLeaving,
  generateNewHostInRoom,
  broadcastRoomUserInfo,
} from "./roomService.js"

function handleNewConnection(userId, socket) {
  // Attaching custom peroperties "isUser" and "userId" to socket.
  // userId (passed in from Firebase) is null if the user isn't registered.
  socket.isUser = userId ? true : false

  // socket.userId will be set and used in lieu of passing around
  // the userId param constantly from client to server.
  // It encompasses both Auth and Guest users, so it can be
  // thought of as the "server id".
  socket.userId = userId || socket.id

  console.log(`From handleNewConnection: ${socket.userId}`)
}

async function createNewUser(userId) {
  if (userId) {
    try {
      const existingUser = await User.findById(userId).lean()
      if (!existingUser) {
        await User.create({ _id: userId, userId: userId })
      }
    } catch (error) {
      console.error(
        `Error initializing user info in the database: ${error.message}`
      )
      throw error
    }

    // TODO: Not sure if we need this, but it is explicit.
    // socket.userId = userId
  }
}

// This only runs for registered users, so no additional checks are needed.
async function getUserStats(userId) {
  try {
    const user = await User.findById(userId).lean()
    if (!user) {
      console.error(`No guest or user found with userId: ${userId}`)
    }
    return user
  } catch (error) {
    console.error(`Error getting user info from the database: ${error.message}`)
    throw error
  }
}

function setDisplayName(roomId, userId, displayName) {
  const roomUserInfo = getRoomUserInfo(roomId)
  if (roomUserInfo) {
    const previousValue = roomUserInfo.get(userId)
    roomUserInfo.set(userId, { ...previousValue, displayName: displayName })
  }
}

// Already need to be in the room to keep displayName up to date with changes
function handleDisplayNameUpdate(roomId, userId, updatedDisplayName, io) {
  if (roomInLobby(roomId) && isUserInRoom(roomId, userId)) {
    setDisplayName(roomId, userId, updatedDisplayName)
    broadcastRoomUserInfo(roomId, io)
  }
}

// Handle streak updates in the database for all users in the room
async function handleUserStreakUpdates(winnerUserId, roomId) {
  try {
    const users = getUsersInRoom(roomId)
    if (users) {
      const resetPromises = users.map(async (userId) => {
        const user = await User.findOne({ userId })
        if (user) {
          if (userId === winnerUserId) {
            await User.updateOne({ userId }, { $inc: { currStreak: 1 } })
            return User.updateOne(
              { userId },
              { $max: { maxStreak: user.currStreak } }
            )
          } else {
            return User.updateOne({ userId }, { $set: { currStreak: 0 } })
          }
        }
      })
      await Promise.all(resetPromises)
    }
  } catch (error) {
    console.error(`Error setting streaks in the database: ${error.message}`)
    throw error
  }
}

async function handleUserStreakReset(userId) {
  try {
    await User.updateOne({ userId }, { $set: { currStreak: 0 } })
  } catch (error) {
    console.error(`Error resetting streaks in the database: ${error.message}`)
    throw error
  }
}

async function handleUserDisconnect(socket, io) {
  console.log(`A user disconnected with userId: ${socket.userId}`)
  handleLeaveRoom(socket, io)
}

async function handleLeaveRoom(socket, io) {
  const roomId = socket.roomId
  if (roomId) {
    console.log(`Removing user ${socket.userId} from ${roomId}`)
    socket.roomId = null
    removeUserFromRoom(socket.userId, roomId)
    if (isRoomEmpty(roomId)) {
      deleteRoom(roomId)
    } else {
      if (isHostLeaving(roomId, socket.userId)) {
        const newHostId = generateNewHostInRoom(roomId)
        io.to(roomId).emit("newHost", newHostId)
      }
    }
  }
  broadcastRoomUserInfo(roomId, io)
}

export {
  handleNewConnection,
  createNewUser,
  // getUser,
  setDisplayName,
  handleDisplayNameUpdate,
  handleUserStreakUpdates,
  handleUserStreakReset,
  handleUserDisconnect,
  handleLeaveRoom,
}
