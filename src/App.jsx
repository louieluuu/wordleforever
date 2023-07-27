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
  const [isChallengeOn, setIsChallengeOn] = useState(false)

  // Countdown states
  const [isCountdownOver, setIsCountdownOver] = useState(false)
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
  const [otherBoards, setOtherBoards] = useState([])

  // Framer-Motion fade out
  const location = useLocation()

  // ! Socket useEffect
  // TODO: Passing in states to sockets ** THAT ARE UNDER A useEffect
  // TODO: HOOK WITHOUT SPECIFIED DEPENDENCIES ** seems to result in unreliable behaviour.

  useEffect(() => {
    socket.on(
      "gameStarted",
      (roomId, allGameBoards, solution, isChallengeOn, challengeModeGuess) => {
        resetStates()

        // Filter out the socket's own gameBoard.
        const otherBoards = allGameBoards.filter((object) => object.socketId !== socket.id)
        setOtherBoards(otherBoards)

        setRoomId(roomId)
        setSolution(solution)
        setIsChallengeOn(isChallengeOn)

        // ! Challenge Mode specific
        if (challengeModeGuess !== null) {
          setUserGuess(challengeModeGuess)
        }
      }
    )

    // TODO: more cleanup
    return () => {
      socket.off("connect")
    }
  }, [])

  useEffect(() => {
    return () => {
      socket.off("gameStarted")
      socket.off("noMatchesFound")
      socket.off("matchFound")
      socket.off("gameOver")
      socket.off("gameBoardBroadcasted")
      socket.off("otherBoardUpdated")
      socket.off("roomCreated")
    }
  }, [])

  // Unlike the server-side, not all socket logic can be grouped under one umbrella.
  // The dependencies are specific to this particular event.
  useEffect(() => {
    socket.on("otherBoardUpdated", (socketId, otherBoard) => {
      const newOtherBoards = [...otherBoards]

      newOtherBoards.forEach((object) => {
        if (object.socketId === socketId) {
          object.gameBoard = otherBoard
        }
      })

      setOtherBoards(newOtherBoards)
    })
  }, [otherBoards])

  useEffect(() => {
    socket.on("gameOver", (roomId) => {
      setIsGameOver(true)
      socket.emit("revealGameBoard", roomId, gameBoard)
    })

    socket.on("gameBoardBroadcasted", (socketId, finalBoard) => {
      const newOtherBoards = [...otherBoards]

      newOtherBoards.forEach((object) => {
        if (object.socketId === socketId) {
          object.gameBoard = finalBoard
        }
      })
      setOtherBoards(newOtherBoards)
    })
  }, [gameBoard, isGameOver, otherBoards]) // ? Dependencies could be buggy

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

  /**
   *
   * HELPER FUNCTIONS
   *
   */

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
    setIsCountdownOver(false)
    setGameBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })))
    setOtherBoards([])
    setIsInGame(true)
    setIsConfettiRunning(false)
    setHints({ green: new Set(), yellow: new Set(), gray: new Set() })
    setShowAlertModal(false)
  }

  // Generates a random solution
  function getRandomSolution() {
    const randomSolution = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
      .toUpperCase()
      .split("")
    console.log(`Solution: ${randomSolution}`)
    return randomSolution
  }

  // ! Challenge mode
  // Generates a random starting word that always has exactly one green match
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
      handleNewGame(gameMode)
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
    else if (!VALID_GUESSES.includes(userGuess.join("").toLowerCase())) {
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

    // Correct guess: Game Over (win)
    // Direct array comparison won't work with ===, so we must compare their string forms.
    if (userGuess.join("") === solution.join("")) {
      socket.emit("correctGuess", socket.id, roomId)
      showWinAnimations()
      setIsConfettiRunning(true)
      setIsGameOver(true)
    }
    // Wrong guess
    else {
      // ! Socket
      socket.emit("wrongGuess", socket.id, roomId, newGameBoard)
      // Run out of guesses: Game Over (loss)
      if (currentRow >= 5) {
        setIsOutOfGuesses(true)
        if (gameMode.includes("online")) {
          socket.emit("outOfGuesses", roomId)
        }
        //
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

  // Using only client-side.
  function startNewClassicGame() {
    resetStates()

    const solution = getRandomSolution()
    if (isChallengeOn) {
      const firstGuess = getRandomFirstGuess(solution)
      setUserGuess(firstGuess)
    }
    setSolution(solution)
  }

  // seekMatch() and leaveRoom() used to exist at the MenuOnlineModes level,
  // but since the New Game button requires these functions, they have to be out here.

  function seekMatch() {
    socket.emit("seekMatch", isChallengeOn)
    setGameMode("online-public")

    socket.on("noMatchesFound", () => {
      console.log("Received noMatchesFound. Creating online-public room...\n")
      createRoom("online-public")
    })

    socket.on("matchFound", (roomId) => {
      console.log("MATCHFOUND MATCH FOUND MATCH FOUND")
      navigate(`/room/${roomId}`)
    })
  }

  function createRoom(gameMode) {
    console.log(`gameMode from createRoom: ${gameMode}`)
    setGameMode(gameMode)

    socket.emit("createRoom", socket.id, nickname, gameMode, isChallengeOn)

    socket.on("roomCreated", (roomId) => {
      console.log("roomCreated called.")

      // Only private rooms require hosts. Public rooms will start on a shared timer.
      if (gameMode === "online-private") {
        setIsHost(true)
      }
      navigate(`/room/${roomId}`)
    })
  }

  function leaveRoom() {
    socket.emit("leaveRoom", roomId)
    console.log(`Leaving room ${roomId}`)
    setGameMode("")
    setIsHost(false)
    setIsInGame(false)
  }

  function handleNewGame(gameMode) {
    if (gameMode === "online-public") {
      console.log("Online-public in here!")
      leaveRoom()
      seekMatch()
    }
    //
    else if (gameMode === "online-private") {
      socket.emit("startNewGame", roomId)
    }
    //
    else if (gameMode === "offline-classic") {
      startNewClassicGame()
    }
    //
    else if (gameMode === "offline-vsBot") {
      console.log("in development")
    }
  }

  // TODO: Move Keyboard events into Keyboard component
  // TODO: "Game" component that houses game logic?
  // TODO: Row and Tile components
  // TODO: Look into Context (stores) so props aren't so ugly
  return (
    <>
      <Header />

      {isInGame ? (
        <>
          <div className="game-container">
            {!isCountdownOver && (
              <CountdownTimer
                isCountdownOver={isCountdownOver}
                setIsCountdownOver={setIsCountdownOver}
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
              {otherBoards.map((object) => (
                <GameBoard
                  key={object.socketId}
                  nickname={object.nickname}
                  gameBoard={object.gameBoard}
                  userGuess={userGuess}
                  currentRow={-1}
                  currentTile={currentTile}
                  isGameOver={isGameOver}
                  gameMode={gameMode}
                />
              ))}
            </div>
          </div>

          <Keyboard
            hints={hints}
            isOutOfGuesses={isOutOfGuesses}
            isGameOver={isGameOver}
            isInGame={isInGame}
            isCountdownOver={isCountdownOver}
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

          <ChallengeForm setIsChallengeOn={setIsChallengeOn} />

          <AnimatePresence mode="wait">
            <Routes key={location.pathname} location={location}>
              <Route path="/" element={<MenuLandingPage setIsChallengeOn={setIsChallengeOn} />} />
              <Route
                path="/online"
                element={
                  <MenuOnlineModes
                    setIsHost={setIsHost}
                    isChallengeOn={isChallengeOn}
                    nickname={nickname}
                    setGameMode={setGameMode}
                    seekMatch={seekMatch}
                    createRoom={createRoom}
                  />
                }
              />

              <Route
                path="/room/:roomId"
                element={
                  <WaitingRoom
                    isHost={isHost}
                    setIsHost={setIsHost}
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    setRoomId={setRoomId}
                    nickname={nickname}
                    leaveRoom={leaveRoom}
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
