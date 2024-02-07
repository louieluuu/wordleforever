// Database models
import User from "../database/User.js"

// Classes
import Room from "../classes/Room.js"

// Services
import {
  getRoom,
  roomInLobby,
  isUserInRoom,
  getUsersInRoom,
  deleteRoom,
  removeUserFromRoom,
  isRoomEmpty,
  isUserHostInRoom,
  generateNewHostInRoom,
} from "./roomService.js"

async function createNewUser(userId) {
  try {
    const existingUser = await User.findById(userId).lean()
    if (!existingUser) {
      const newUser = new User({ _id: userId, userId })
      await newUser.save()
    }
  } catch (error) {
    console.error(
      `Error initializing user info in the database: ${error.message}`
    )
    throw error
  }
}

async function getUser(userId) {
  try {
    const user = await User.findOne({ userId }).lean()
    return user
  } catch (error) {
    console.error(`Error getting user info from the database: ${error.message}`)
    throw error
  }
}

async function getAllUserInfoInRoom(roomId) {
  try {
    const room = getRoom(roomId)
    if (room instanceof Room) {
      const allUserInfo = []
      for (const userId of room.users) {
        const user = await getUser(userId)
        if (user) {
          allUserInfo.push(user)
        }
      }
      return allUserInfo
    }
  } catch (error) {
    console.error(`Error getting user info from room: ${error.message}`)
    throw error
  }
}

async function deleteUser(userId) {
  try {
    await User.deleteOne({ userId })
  } catch (error) {
    console.error(`Error deleting user from the database: ${error.message}`)
    throw error
  }
}

async function setUsername(userId, username) {
  try {
    await User.updateOne({ userId }, { $set: { username } })
  } catch (error) {
    console.error(`Error setting username in the database: ${error.message}`)
    throw error
  }
}

// Already need to be in the room to keep username up to date with changes
async function handleUsernameUpdate(roomId, userId, username, io) {
  if (roomInLobby(roomId) && isUserInRoom(roomId, userId)) {
    await setUsername(userId, username)
    broadcastUserInfo(roomId, io)
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

async function broadcastUserInfo(roomId, io) {
  if (roomId) {
    io.to(roomId).emit("userInfoUpdated", await getAllUserInfoInRoom(roomId))
  } else {
    console.error("Invalid roomId for broadcasting user info")
  }
}

async function handleUserDisconnect(socket, io) {
  console.log(`User ${socket.id} disconnected`)
  handleLeaveRoom(socket, io)
  deleteUser(socket.id)
}

async function handleLeaveRoom(socket, io) {
  const roomId = socket.roomId
  if (roomId) {
    console.log(`Removing user ${socket.id} from ${roomId}`)
    socket.roomId = null
    removeUserFromRoom(socket.id, roomId)
    if (isRoomEmpty(roomId)) {
      deleteRoom(roomId)
    } else {
      if (isUserHostInRoom(roomId, socket.id)) {
        const newHostId = generateNewHostInRoom(roomId)
        io.to(roomId).emit("newHost", newHostId)
      }
    }
  }
  broadcastUserInfo(roomId, io)
}

export {
  createNewUser,
  getUser,
  getAllUserInfoInRoom,
  setUsername,
  handleUsernameUpdate,
  handleUserStreakUpdates,
  handleUserStreakReset,
  broadcastUserInfo,
  handleUserDisconnect,
  handleLeaveRoom,
}
