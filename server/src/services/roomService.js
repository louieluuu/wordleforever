import { v4 as uuidv4 } from 'uuid'

const Private = new Map()
const Public = new Map()
const Rooms = { Private, Public }

// Needed for the initial creation of rooms before the roomId is placed in it's own map
function getRoomTypeFromConnection(mode) {
	if (mode === 'online-private') {
		return Rooms.Private
	} else if (mode === 'online-public') {
		return Rooms.Public
	} else {
		return undefined
	}
}

function getRoomTypeFromId(roomId) {
	if (Rooms.Private.has(roomId)) {
		return Rooms.Private
	} else if (Rooms.Public.has(roomId)) {
		return Rooms.Public
	} else {
		return undefined
	}
}

function getRoomFromId(roomId) {
	if (roomExists(roomId)) {
		return getRoomTypeFromId(roomId).get(roomId)
	}
	return undefined
}

function roomExists(roomId) {
	const rooms = getRoomTypeFromId(roomId)
	if (rooms === undefined) {
		return false
	}
	return true
}

function initializeRoom(connectionMode, gameMode, socket) {
	const roomId = uuidv4()
	initializeRoomInfo(roomId, connectionMode, socket)
	setRoomConnectionMode(roomId, connectionMode)
	setRoomGameMode(roomId, gameMode)
	return roomId
}

function initializeRoomInfo(roomId, connectionMode, socket) {
	const rooms = getRoomTypeFromConnection(connectionMode)
	const room = getRoomFromId(roomId)
    rooms.set(roomId, {
		...room,
        userInfo: new Map(),
		connectionMode: null,
		gameMode: null,
		hostSocketId: socket.id,
		countGameOvers: 0,
		countOutOfGuesses: 0,
		inGame: false,
    })
}

function setRoomInGame(roomId) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			inGame: true,
		})
	}
}

function setRoomOutOfGame(roomId) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			inGame: false,
		})
	}
}

function roomInLobby(roomId) {
	if (roomExists(roomId)) {
		if (getRoomFromId(roomId).inGame === false) {
			return true
		}
	}
	return false
}

function resetRoomInfo(roomId) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			countGameOvers: 0,
			countOutOfGuesses: 0,
		})
	}
}

function setRoomConnectionMode(roomId, connectionMode) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			connectionMode: connectionMode,
		})
	}
}

function getRoomConnectionMode(roomId) {
	return getRoomFromId(roomId).connectionMode
}

function setRoomGameMode(roomId, gameMode) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			gameMode: gameMode,
		})
	}
}

function getRoomGameMode(roomId) {
	return getRoomFromId(roomId).gameMode
}

function incrementCountGameOvers(roomId) {
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			countGameOvers: room.countGameOvers + 1,
		})
	}
}

function getCountGameOvers(roomId) {
	return getRoomFromId(roomId).countGameOvers
}

function incrementCountOutOfGuesses(roomId) {
	console.log('incrementing out of guesses')
	if (roomExists(roomId)) {
		const rooms = getRoomTypeFromId(roomId)
		const room = getRoomFromId(roomId)
		rooms.set(roomId, {
			...room,
			countOutOfGuesses: room.countOutOfGuesses + 1,
		})
		console.log('after incrementing its', room.countOutOfGuesses)
	}
}

function getCountOutOfGuesses(roomId) {
	return getRoomFromId(roomId).countOutOfGuesses
}

function getRoomSize(roomId, io) {
	return io.sockets.adapter.rooms.get(roomId).size
}

export {
	roomExists,
	initializeRoom,
	getRoomTypeFromId,
	getRoomFromId,
	getRoomConnectionMode,
	getRoomGameMode,
	incrementCountGameOvers,
	getCountGameOvers,
	incrementCountOutOfGuesses,
	getCountOutOfGuesses,
	getRoomSize,
	resetRoomInfo,
	setRoomInGame,
	setRoomOutOfGame,
	roomInLobby,
}