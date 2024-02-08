// Database models
import User from "../database/User.js"

// Classes
import Room from "../classes/Room.js"
import Guest from "../classes/Guest.js"

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

const Guests = new Map()

function createNewGuest(socketId) {
  const newGuest = new Guest(socketId)
  Guests.set(socketId, newGuest)

  console.log(`New guest created with socketId: ${socketId}`)
}

function handleNewConnection(userId, socket) {
  // Attaching custom property "userId" to socket.
  // It is either the Firebase Auth id string, or null if not a user.
  // Following this function, we will call socket.userId in lieu of
  // passing around the actual userId variable from the client side.
  socket.userId = userId

  if (!socket.userId) {
    createNewGuest(socket.id)
  }
}

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
  if (Guests.has(userId)) {
    const guest = Guests.get(userId)
    return guest
  }

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

async function getAllUserInfoInRoom(roomId) {
  const userIds = getUsersInRoom(roomId)

  try {
    if (userIds) {
      const allUserInfo = []

      for (const userId of userIds) {
        const user = await getUser(userId)
        if (user) {
          allUserInfo.push(user)
        }
      }

      console.log(`allUserInfo: ${JSON.stringify(allUserInfo)}`)

      return allUserInfo
    }
  } catch (error) {
    console.error(`Error getting user info from room: ${error.message}`)
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
  console.log(`A user disconnected with socketId: ${socket.id}`)
  handleLeaveRoom(socket, io)
  Guests.delete(socket.id)
  console.log(`Guest ${socket.id} removed from Guests map`)
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
  handleNewConnection,
  createNewGuest,
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
