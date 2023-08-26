import { useState, useEffect } from "react"

// Socket
import { socket } from "./socket"

// Data
import { WORD_LIST } from "./data/wordList"
import { VALID_GUESSES } from "./data/validGuesses"
import { WIN_MESSAGES } from "./data/winMessages"

// Components
import Header from "./components/Header"
import WelcomeMessage from "./components/WelcomeMessage"
import GameBoard from "./components/GameBoard"
import Keyboard from "./components/Keyboard"

import ChallengeForm from "./components/ChallengeForm"
import MenuLandingPage from "./components/MenuLandingPage"
import MenuOnlineModes from "./components/MenuOnlineModes"
import MenuOfflineModes from "./components/MenuOfflineModes"
import WaitingRoom from "./components/WaitingRoom"

import AlertModal from "./components/AlertModal"
import CountdownTimer from "./components/CountdownTimer"
import Confetti from "react-confetti"

// React-icons
import { IoReturnDownBackSharp } from "react-icons/io5"

// Framer-Motion
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

function App() {
  const navigate = useNavigate()

  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)

  // userGuess and solution are arrays instead of strings because arrays are
  // more useful in many cases, ex. to render via .map().
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])

  // Updates upon every submitted guess, not every key stroke. In this way, the gameBoard
  // represents the "history" of the game, and the userGuess represents the "current" state.
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" }))
  )

  const [hints, setHints] = useState({ green: new Set(), yellow: new Set(), gray: new Set() })

  const [isGameOver, setIsGameOver] = useState(false)
  const [isOutOfGuesses, setIsOutOfGuesses] = useState(false)
  // localStorage stores items as strings, so we use JSON.parse to convert it back to its original type.
  const [isChallengeOn, setIsChallengeOn] = useState(
    JSON.parse(localStorage.getItem("isChallengeOn")) || false
  )

  // Countdown states
  const [isCountdownRunning, setIsCountdownRunning] = useState(false)
  const [isConfettiRunning, setIsConfettiRunning] = useState(false)
  const [numberOfPieces, setNumberOfPieces] = useState(0)

  // Alert states
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // ! Socket states
  const [roomId, setRoomId] = useState("")
  const [gameMode, setGameMode] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [isInGame, setIsInGame] = useState(false)
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "Wordler")
  const [streak, setStreak] = useState(JSON.parse(localStorage.getItem("streak")) || 0)
  const [gameBoards, setGameBoards] = useState([])

  // Framer-Motion fade out
  const location = useLocation()

  // ! Socket useEffect
  // TODO: Passing in states to sockets ** THAT ARE UNDER A useEffect
  // TODO: HOOK WITHOUT SPECIFIED DEPENDENCIES ** seems to result in unreliable behaviour.

  // TODO: Could probably order these socket useEffects in a way that makes more sense.

  useEffect(() => {
    socket.on("roomLeft", () => {
      console.log("ROOM LEFT!!!!!!!!!!!!!!!!!!!")
      seekMatch()
    })

    return () => {
      socket.off("roomLeft")
    }
  }, [])

  useEffect(() => {
    socket.on("roomCreated", (roomId) => {
      // Only private rooms require hosts. Public rooms will start on a shared timer.
      if (gameMode === "online-private") {
        setIsHost(true)
      }

      console.log("Navigating to /roomId!")
      navigate(`/room/${roomId}`)
    })

    socket.on("noMatchesFound", () => {
      createRoom("online-public")
    })

    socket.on("matchFound", (roomId) => {
      navigate(`/room/${roomId}`)
    })

    return () => {
      socket.off("roomCreated")
      socket.off("noMatchesFound")
      socket.off("matchFound")
    }
  }, [gameMode]) // TODO: If you don't add gameMode as a dep here, it'll be stale. Wowee

  useEffect(() => {
    socket.on(
      "gameStarted",
      (roomId, allGameBoards, solution, isChallengeOn, challengeModeGuess) => {
        resetStates()

        console.log("gameStarted")

        // Sort gameBoards so that the client's board is always first.
        const sortedGameBoards = allGameBoards.sort((objA, objB) => {
          if (objA.socketId === socket.id) {
            return -1
          } else {
            return 1
          }
        })

        setGameBoards(sortedGameBoards)

        setRoomId(roomId)
        setSolution(solution)
        setIsChallengeOn(isChallengeOn)

        // ! Challenge Mode specific
        if (challengeModeGuess !== null) {
          setUserGuess(challengeModeGuess)
        }
      }
    )

    return () => {
      socket.off("gameStarted")
    }
  }, [])

  useEffect(() => {
    socket.on("gameBoardsUpdated", (updatedSocketId, updatedBoard, pointsEarned) => {
      const newGameBoards = [...gameBoards]

      newGameBoards.forEach((object) => {
        if (object.socketId === updatedSocketId) {
          object.gameBoard = updatedBoard
          object.points = object.points + pointsEarned
        }
      })

      setGameBoards(newGameBoards)
    })

    return () => {
      socket.off("gameBoardsUpdated")
    }
  }, [gameBoards])

  useEffect(() => {
    socket.on("gameOver", (roomId) => {
      setIsGameOver(true)
      socket.emit("revealFinalGameBoards", roomId)
    })

    socket.on("finalGameBoardsRevealed", (finalGameBoards) => {
      // Sort finalGameBoards so that the client's own board is always first.
      const sortedFinalGameBoards = finalGameBoards.sort((objA, objB) => {
        if (objA.socketId === socket.id) {
          return -1
        } else {
          return 1
        }
      })

      setGameBoards(sortedFinalGameBoards)
    })

    // TODO: This logic might not belong in this useEffect umbrella.
    // TODO: Check dependencies, or just place it in a separate useEffect if buggy.
    socket.on("loseStreak", () => {
      updateStreak(0)
    })

    return () => {
      socket.off("gameOver")
      socket.off("finalGameBoardsRevealed")
      socket.off("loseStreak")
    }
  }, [gameBoard, isGameOver, gameBoards]) // TODO: Dependencies could be buggy

  // Confetti timer
  useEffect(() => {
    setNumberOfPieces(200)

    const confettiTimer = setTimeout(() => {
      setNumberOfPieces(0)
    }, 5000)

    return () => {
      clearTimeout(confettiTimer)
    }
  }, [isConfettiRunning])

  /*
   * HELPER FUNCTIONS
   */

  // Generates a random solution
  function getRandomSolution() {
    const randomSolution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
      .toUpperCase()
      .split("")
    console.log(`Solution: ${randomSolution}`)
    return randomSolution
  }

  // Challenge Mode:
  // generates a random starting word that always has exactly one green match
  function getRandomFirstGuess(solution) {
    let randomFirstGuess

    while (true) {
      randomFirstGuess =
        VALID_GUESSES[Math.floor(Math.random() * VALID_GUESSES.length)].toUpperCase()
      let countGreenLetters = 0
      for (let i = 0; i < randomFirstGuess.length; ++i) {
        if (randomFirstGuess[i] === solution[i]) {
          countGreenLetters += 1
        }
      }
      if (countGreenLetters === 1) {
        return randomFirstGuess.split("")
      }
    }
  }

  function isValidGuess(guess) {
    return VALID_GUESSES.includes(guess)
  }

  function updateStreak(newStreak) {
    localStorage.setItem("streak", newStreak)
    setStreak(newStreak)
  }

  function handleNicknameChange(e) {
    const newNickname = e.target.value

    // Enforce nickname length limit
    if (newNickname.length > 20) {
      return
    }

    if (gameMode.includes("online")) {
      socket.emit("nicknameChange", roomId, socket.id, newNickname)
    }

    setNickname(newNickname)
    localStorage.setItem("nickname", newNickname)
  }

  function resetStates() {
    setCurrentRow(0)
    setCurrentTile(0)
    setUserGuess(["", "", "", "", ""])
    setIsOutOfGuesses(false)
    setIsGameOver(false)
    setIsCountdownRunning(true)
    setGameBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })))
    setGameBoards([])
    setIsInGame(true)
    setIsConfettiRunning(false)
    setHints({ green: new Set(), yellow: new Set(), gray: new Set() })
    setShowAlertModal(false)
  }

  // Checks if the userGuess adheres to the previous hints.
  function usesPreviousHints() {
    // No previous hints
    if (currentRow === 0) {
      return "yes"
    }

    // Creating a deep copy of a row in a 2d matrix is surprisingly elusive...
    // const copyPreviousGuess = [...gameBoard[currentRow - 1]] does not work.
    // This JSON method is one way I found to do it.
    const copyPreviousGuess = JSON.parse(JSON.stringify(gameBoard[currentRow - 1]))
    const colorizedGuess = colorizeGuess(userGuess, solution)

    // Pass 1: Green
    for (let i = 0; i < copyPreviousGuess.length; ++i) {
      if (copyPreviousGuess[i].color === "correct") {
        if (colorizedGuess[i].letter !== copyPreviousGuess[i].letter) {
          return "green"
        }
        // Remove the letter so it won't affect the next pass
        colorizedGuess[i].letter = ""
      }
    }

    // Pass 2: Yellow
    for (let i = 0; i < copyPreviousGuess.length; ++i) {
      if (copyPreviousGuess[i].color === "wrong-position") {
        const index = colorizedGuess.findIndex((obj) => obj.letter === copyPreviousGuess[i].letter)
        if (index === -1) {
          return "yellow"
        }
        copyPreviousGuess[i].color = "none"
        colorizedGuess[index].letter = null
      }
    }

    // Pass 3: If there are still yellows remaining, fails the test
    for (let i = 0; i < copyPreviousGuess.length; ++i) {
      if (copyPreviousGuess[i].color === "wrong-position") {
        return "yellow"
      }
    }

    return "yes"
  }

  // Three-pass algorithm that evaluates the userGuess and assigns colors accordingly.
  function colorizeGuess(guess, solution) {
    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]
    const colorizedGuess = [...guess]

    // 1: Identify greens
    guess.forEach((letter, letterIndex) => {
      if (letter === solution[letterIndex]) {
        colorizedGuess[letterIndex] = { letter: letter, color: "correct" }
        copySolution[letterIndex] = null
      }
    })

    // 2: Identify yellows
    guess.forEach((letter, letterIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (colorizedGuess[letterIndex].color !== "correct") {
        let includedIndex = copySolution.indexOf(letter)
        if (includedIndex !== -1) {
          colorizedGuess[letterIndex] = { letter: letter, color: "wrong-position" }
          copySolution[includedIndex] = null
        }
      }
    })

    // 3: Any remaining tiles must be wrong
    colorizedGuess.forEach((object, objectIndex) => {
      if (!object.color) {
        colorizedGuess[objectIndex] = { letter: guess[objectIndex], color: "wrong" }
      }
    })

    return colorizedGuess
  }

  function updateHints(colorizedGuess) {
    const newGreenHints = new Set(hints.green)
    const newYellowHints = new Set(hints.yellow)
    const newGrayHints = new Set(hints.gray)

    colorizedGuess.forEach((object) => {
      if (object.color === "correct") {
        newGreenHints.add(object.letter)
      }
      //
      else if (object.color === "wrong-position") {
        newYellowHints.add(object.letter)
      }
      //
      else if (object.color === "wrong") {
        newGrayHints.add(object.letter)
      }
    })

    const newHints = { green: newGreenHints, yellow: newYellowHints, gray: newGrayHints }

    setHints(newHints)
  }

  function showWinAnimations() {
    const winMessage = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
    setAlertMessage(winMessage)
    setShowAlertModal(true)
  }

  function handleEnter() {
    // Allows user to start a new game by pressing Enter instead of clicking.
    if (isGameOver) {
      console.log(`gameMode: ${gameMode}`)
      handleNewGame(gameMode, roomId) // TODO: Can this roomId be trusted?
      return
    }

    const guessLength = userGuess.filter((letter) => letter !== "").length

    // Guess is too short
    if (guessLength < 5) {
      setAlertMessage("Not enough letters!")
      setShowAlertModal(true)
      return
    }
    // Guess is invalid (i.e. doesn't appear in dictionary)
    else if (!isValidGuess(userGuess.join("").toLowerCase())) {
      setAlertMessage("Not in dictionary!")
      setShowAlertModal(true)
      return
    }
    // Challenge Mode: guess doesn't adhere to previous hints
    else if (isChallengeOn) {
      const result = usesPreviousHints()
      if (result !== "yes") {
        setAlertMessage(`Must use ${result} hints!`)
        setShowAlertModal(true)
        return
      }
    }

    // Guess is valid: submit guess
    // Update the gameBoard with the colorized guess
    const colorizedGuess = colorizeGuess(userGuess, solution)
    const newGameBoard = [...gameBoard]
    newGameBoard[currentRow] = colorizedGuess
    setGameBoard(newGameBoard)

    // Update hints to color the Keyboard keys
    updateHints(colorizedGuess)

    // Correct guess
    // Direct array comparison won't work with ===, so we must compare their string forms.
    if (userGuess.join("") === solution.join("")) {
      if (gameMode.includes("online")) {
        // Only update streak if in public lobby
        if (gameMode === "online-public") {
          const newStreak = streak + 1
          updateStreak(newStreak)
        }
        // Always emit correctGuess in any online mode
        socket.emit("correctGuess", socket.id, roomId, newGameBoard)
      }
      // gameOver shouldn't always be true upon correctGuess in online modes
      // depending on public vs. private. However, in offline, it's always true.
      else if (gameMode.includes("offline")) {
        setIsGameOver(true)
      }

      showWinAnimations()
      setIsConfettiRunning(true)
    }
    // Wrong guess
    else {
      // ! Socket
      if (gameMode.includes("online")) {
        socket.emit("wrongGuess", socket.id, roomId, newGameBoard)
      }

      // Run out of guesses: Game Over (loss)
      if (currentRow >= 5) {
        setIsOutOfGuesses(true)

        if (gameMode.includes("online")) {
          socket.emit("outOfGuesses", roomId)
        }
        //
        // TODO: This logic might be a little funky. (the else clause)
        else {
          setAlertMessage(solution.join(""))
          setShowAlertModal(true)
          setIsGameOver(true)
        }
      }
    }
    // Game continues: note that these states will be changed regardless of whether
    // the game is over or not. This allows the winning row to be properly rendered as well.
    setCurrentRow((currentRow) => currentRow + 1)
    setCurrentTile(0)
    setUserGuess(["", "", "", "", ""])
  }

  function handleBackspace() {
    if (currentTile !== 0) {
      setCurrentTile((currentTile) => currentTile - 1)

      const newGuess = [...userGuess]
      newGuess[currentTile - 1] = ""
      setUserGuess(newGuess)
    }
  }

  function handleLetter(letter) {
    if (currentTile < 5) {
      const newGuess = [...userGuess]
      newGuess[currentTile] = letter.toUpperCase()
      setUserGuess(newGuess)

      setCurrentTile((currentTile) => currentTile + 1)
    }
  }

  // TODO: Very odd, but passing in the roomId state below doesn't work.
  // TODO: Have to maintain and pass around the roomId in the sockets.
  // TODO: Extra strange, because handleNicknameChange() is able to use
  // TODO: the roomId state just fine. Huh.
  function startNewGame(gameMode, roomId) {
    if (gameMode.includes("online")) {
      socket.emit("startNewOnlineGame", roomId)
    }

    // Note that the offlineMode calls resetStates() here; online
    // modes will have resetStates() called when io emits "gameStarted".
    else if (gameMode.includes("offline")) {
      resetStates()

      const solution = getRandomSolution()
      if (isChallengeOn) {
        const firstGuess = getRandomFirstGuess(solution)
        setUserGuess(firstGuess)
      }
      setSolution(solution)
    }
  }

  // Note that there's a difference between handleNewGame and startNewGame.
  // When you click the NEW GAME button in online-public, you're not actually
  // starting a new game right away. You have to leave the room and seek a new match.
  function handleNewGame(gameMode, roomId = undefined) {
    if (isInGame && gameMode === "online-public") {
      leaveRoom()
    }
    //
    else {
      startNewGame(gameMode, roomId)
    }
  }

  // seekMatch() and leaveRoom() used to exist at the MenuOnlineModes level,
  // but since the New Game button requires these functions, they have to be out here.

  function seekMatch() {
    setGameMode("online-public")
    socket.emit("seekMatch", isChallengeOn)
  }

  function createRoom(gameMode) {
    setGameMode(gameMode)
    console.log("Creating room from Client...")
    socket.emit("createRoom", gameMode, isChallengeOn)
  }

  function leaveRoom() {
    socket.emit("leaveRoom", roomId, isInGame)
    console.log(`Leaving room ${roomId} with isInGame: ${isInGame}`)
    setGameMode("")
    setRoomId("")
    setIsHost(false)
    setIsInGame(false)
  }

  // TODO: 1. Move Keyboard events into Keyboard component
  // TODO: 2. "Game" component that houses game logic?
  // TODO: 3. Row and Tile components
  // TODO: 4. Look into Context (stores) so props aren't so ugly
  return (
    <>
      <Header />

      {isInGame ? (
        <>
          <div className="game-container">
            {isCountdownRunning && (
              <CountdownTimer
                isCountdownRunning={isCountdownRunning}
                setIsCountdownRunning={setIsCountdownRunning}
                isChallengeOn={isChallengeOn}
                handleEnter={handleEnter}
              />
            )}

            <button
              className={isGameOver ? "btn--new-game" : "btn--new-game--hidden"}
              onClick={handleEnter}>
              NEW GAME
              <IoReturnDownBackSharp />
            </button>

            <AlertModal
              message={alertMessage}
              showAlertModal={showAlertModal}
              setShowAlertModal={setShowAlertModal}
              isOutOfGuesses={isOutOfGuesses}
              isConfettiRunning={isConfettiRunning}
            />

            <div className="boards-container">
              {gameMode.includes("offline") ? (
                <GameBoard
                  gameBoard={gameBoard}
                  nickname={nickname}
                  userGuess={userGuess}
                  currentRow={currentRow}
                  currentTile={currentTile}
                  isGameOver={isGameOver}
                  isOutOfGuesses={isOutOfGuesses}
                  gameMode={gameMode}
                />
              ) : (
                gameBoards.map((object) => (
                  // We conditionally pass in props here to give the client's own gameBoard a
                  // "special" view. Ex., its letters should always show (unlike other gameBoards,
                  // which have their letters hidden until the game is over).
                  <GameBoard
                    key={object.socketId}
                    gameBoard={object.socketId === socket.id ? gameBoard : object.gameBoard}
                    nickname={object.nickname}
                    streak={object.streak}
                    points={object.points}
                    userGuess={userGuess}
                    currentRow={object.socketId === socket.id ? currentRow : -1}
                    currentTile={currentTile}
                    isGameOver={isGameOver}
                    isOutOfGuesses={isOutOfGuesses}
                    gameMode={gameMode}
                  />
                ))
              )}
            </div>
          </div>

          <Keyboard
            hints={hints}
            isOutOfGuesses={isOutOfGuesses}
            isGameOver={isGameOver}
            isInGame={isInGame}
            isCountdownRunning={isCountdownRunning}
            handleLetter={handleLetter}
            handleEnter={handleEnter}
            handleBackspace={handleBackspace}
          />

          {isConfettiRunning && <Confetti numberOfPieces={numberOfPieces} initialVelocityY={-10} />}
        </>
      ) : (
        <>
          <h1 className="menu__title">
            <WelcomeMessage nickname={nickname} handleNicknameChange={handleNicknameChange} />
          </h1>

          <ChallengeForm isChallengeOn={isChallengeOn} setIsChallengeOn={setIsChallengeOn} />

          <AnimatePresence mode="wait">
            <Routes key={location.pathname} location={location}>
              <Route path="/" element={<MenuLandingPage setIsChallengeOn={setIsChallengeOn} />} />
              <Route
                path="/online"
                element={<MenuOnlineModes seekMatch={seekMatch} createRoom={createRoom} />}
              />

              <Route
                path="/room/:roomId"
                element={
                  <WaitingRoom
                    isHost={isHost}
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    setRoomId={setRoomId}
                    nickname={nickname}
                    streak={streak}
                    leaveRoom={leaveRoom}
                    handleNewGame={handleNewGame}
                  />
                }
              />

              <Route
                path="/offline"
                element={
                  <MenuOfflineModes setGameMode={setGameMode} handleNewGame={handleNewGame} />
                }
              />
            </Routes>
          </AnimatePresence>
        </>
      )}
    </>
  )
}

export default App
