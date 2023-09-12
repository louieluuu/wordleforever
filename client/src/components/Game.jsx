import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { socket } from "../socket"

// Data
import { WORD_LIST } from "../data/wordList"
import { VALID_GUESSES } from "../data/validGuesses"
import { WIN_MESSAGES } from "../data/winMessages"

// Components
import GameBoard from "./GameBoard"
import Keyboard from "./Keyboard"
import AlertModal from "./AlertModal"
import CountdownModal from "./CountdownModal"
import Confetti from "react-confetti"

// React-icons
import { IoReturnDownBackSharp } from "react-icons/io5"

export default function Game({
  isHost,
  gameMode,
  nickname,
  isChallengeOn,
  setIsChallengeOn,
  setIsInGame,
  streak,
  setStreak,
  seekMatch,
}) {
  /*
   * STATES
   */

  const { roomId } = useParams()

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
  const [hasSolved, setHasSolved] = useState(false) // necessary in Private Room to distinguish
  // between a total isGameOver vs. a single player finishing

  // Countdown states
  const [isCountdownRunning, setIsCountdownRunning] = useState(false)
  const [isConfettiRunning, setIsConfettiRunning] = useState(false)
  const [numberOfPieces, setNumberOfPieces] = useState(0)

  // Alert states
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Socket states
  const [gameBoards, setGameBoards] = useState([])

  /*
   * USE EFFECTS
   */

  useEffect(() => {
    if (isGameOver && !hasSolved) {
      setAlertMessage(solution.join(""))
      setShowAlertModal(true)
    }
  }, [isGameOver, hasSolved])

  // TODO: Could probably order these socket useEffects in a way that makes more sense.
  // ! SOCKETS

  useEffect(() => {
    console.log(gameMode)

    socket.on("gameStarted", (allGameBoards, solution, isChallengeOn, challengeModeGuess) => {
      console.log("gameStarted from Game component")

      resetStates()

      // Sort gameBoards so that the client's board is always first.
      const sortedGameBoards = allGameBoards.sort((objA, objB) => {
        if (objA.socketId === socket.id) {
          return -1
        } else {
          return 1
        }
      })

      setGameBoards(sortedGameBoards)
      setSolution(solution)

      // In a Private Room, only the Host's isChallengeOn is taken into account
      // when creating the Room. There's no guarantee that any of the other
      // clients have their isChallengeOn set to true, so we need to set it here
      // in order to make sure that everyone's playing under the same restrictions.
      // Note that we don't actually change the client's localStorage here,
      // so the client will still retain their preference after the game is over.
      setIsChallengeOn(isChallengeOn)

      if (challengeModeGuess !== null) {
        setUserGuess(challengeModeGuess)
      }
    })

    // TODO: Belongs here or somewhere else?
    socket.on("firstSolve", () => {
      showWinAnimations()
    })

    return () => {
      socket.off("gameStarted")
      socket.off("firstSolve")
    }
  }, [])

  // Online games: only the Host should make a request to start the game, so that
  // we don't have multiple solutions, gameBoards, etc. being generated.
  // Offline games: should always start immediately upon Mount.
  useEffect(() => {
    if (isHost) {
      console.log("I'm the desginated host!")
      socket.emit("startNewOnlineGame", roomId)
    }
    //
    else if (gameMode.includes("offline")) {
      console.log("Starting from isHost useEffect")
      startNewGame(gameMode)
    }
  }, [isHost])

  // This socket event will account for both streak and point changes. Of course,
  // only one of those can change at a time because a player can only be in
  // either a Public or Private Room at one time. On the server side,
  // we'll pass null for the value that doesn't change and check for null on the client-side
  // so we know which value to actually change.
  useEffect(() => {
    socket.on("gameBoardsUpdated", (updatedSocketId, updatedBoard, newStreak, pointsEarned) => {
      console.log("gameBoardsUpdated")

      const newGameBoards = [...gameBoards]

      if (newStreak !== null) {
        newGameBoards.forEach((object) => {
          if (object.socketId === updatedSocketId) {
            object.gameBoard = updatedBoard
            object.streak = newStreak
          }
        })
      }

      if (pointsEarned !== null) {
        newGameBoards.forEach((object) => {
          if (object.socketId === updatedSocketId) {
            object.gameBoard = updatedBoard
            object.points = object.points + pointsEarned
          }
        })
      }

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

    // TODO: The below logic(s) might not belong in this useEffect umbrella.
    // TODO: Check dependencies, or just place it in a separate useEffect if buggy.
    socket.on("loseStreak", () => {
      updateStreak(0)
    })

    return () => {
      socket.off("gameOver")
      socket.off("finalGameBoardsRevealed")
      socket.off("loseStreak")
      socket.off("revealSolution")
    }
  }, [gameBoard, isGameOver, gameBoards]) // TODO: deps could be buggy

  // Confetti timer
  // TODO: Check if this logic can be placed in Confetti component.
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

  function startNewGame(gameMode) {
    if (gameMode.includes("online")) {
      socket.emit("startNewOnlineGame", roomId)
    }
    //
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
  // starting a new game right away. You have to seekMatch first.
  function handleNewGame() {
    if (gameMode === "online-public") {
      seekMatch(roomId)
    }
    //
    else {
      startNewGame(gameMode)
    }
  }

  // The VALID_GUESSES array is needed at the Game level.
  // I don't want to import VALID_GUESSES again in the Keyboard component,
  // so I'll just be passing this function in as a prop to Keyboard instead.
  function isValidGuess(guess) {
    return VALID_GUESSES.includes(guess)
  }

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

  function resetStates() {
    // The only state whose reset is conditional; countdowns are only necessary in online play
    // to sync all clients up. Offline modes will never have a countdown.
    if (gameMode.includes("online")) {
      setIsCountdownRunning(true)
    }

    setIsInGame(true)
    setCurrentRow(0)
    setCurrentTile(0)
    setUserGuess(["", "", "", "", ""])
    setIsOutOfGuesses(false)
    setHasSolved(false)
    setIsGameOver(false)
    setGameBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "none" })))
    setGameBoards([])
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

  function handleLetter(letter) {
    if (currentTile < 5) {
      const newGuess = [...userGuess]
      newGuess[currentTile] = letter.toUpperCase()
      setUserGuess(newGuess)

      setCurrentTile((prev) => prev + 1)
    }
  }

  function handleEnter() {
    // Allows user to start a new game by pressing Enter instead of clicking.
    if (isGameOver) {
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
        // Always emit correctGuess in any online mode
        socket.emit("correctGuess", socket.id, roomId, newGameBoard)

        // Only update streak if in public lobby
        if (gameMode === "online-public") {
          const newStreak = streak + 1
          updateStreak(newStreak)
          setHasSolved(true)
          showWinAnimations()
        }

        // Only change this state in private lobby.
        if (gameMode === "online-private") {
          setHasSolved(true)
        }
      }
      // gameOver shouldn't always be true upon correctGuess in online modes
      // depending on public vs. private. However, in offline, it's always true.
      else if (gameMode.includes("offline")) {
        setIsGameOver(true)
        showWinAnimations()
      }
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

          // Game isn't over in a Private Room until everyone's done.
          // Don't reveal solutions, don't setIsGameOver to true.
          if (gameMode === "online-private") {
            return
          }

          if (gameMode === "online-public") {
            setAlertMessage(solution.join(""))
            setShowAlertModal(true)
          }
        }
        //
        else if (gameMode.includes("offline")) {
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

  function showWinAnimations() {
    const winMessage = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
    setAlertMessage(winMessage)
    setShowAlertModal(true)
    setIsConfettiRunning(true)
  }

  function updateStreak(newStreak) {
    localStorage.setItem("streak", newStreak)
    setStreak(newStreak)
  }

  function myGameBoard() {
    return gameBoards[0]
  }

  function otherGameBoards() {
    return gameBoards.slice(1) || []
  }

  return (
    <>
      <div className="game-container">
        {isCountdownRunning && (
          <CountdownModal
            isCountdownRunning={isCountdownRunning}
            setIsCountdownRunning={setIsCountdownRunning}
          />
        )}

        {isConfettiRunning && <Confetti numberOfPieces={numberOfPieces} initialVelocityY={-10} />}

        <button
          className={isGameOver ? "menu__btn--new-game" : "menu__btn--new-game--hidden"}
          onClick={handleNewGame}>
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
              // streak
              // points
              userGuess={userGuess}
              currentRow={currentRow}
              currentTile={currentTile}
              isGameOver={isGameOver}
              isOutOfGuesses={isOutOfGuesses}
              gameMode={gameMode}
            />
          ) : (
            <div style={{ display: "flex", overflowY: "auto" }}>
              <div style={{ position: "sticky", top: "0" }}>
                {myGameBoard() ? (
                  <GameBoard
                    key={myGameBoard().socketId}
                    gameBoard={gameBoard}
                    nickname={myGameBoard().nickname}
                    streak={myGameBoard().streak}
                    points={myGameBoard().points}
                    userGuess={userGuess}
                    currentRow={currentRow}
                    currentTile={currentTile}
                    isGameOver={isGameOver}
                    isOutOfGuesses={isOutOfGuesses}
                    gameMode={gameMode}
                  />
                ) : null}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100px",
                  height: "100px",
                }}>
                {otherGameBoards().map((object) => (
                  <GameBoard
                    key={object.socketId}
                    gameBoard={object.gameBoard}
                    nickname={object.nickname}
                    streak={object.streak}
                    points={object.points}
                    userGuess={userGuess}
                    currentRow={-1}
                    currentTile={currentTile}
                    isGameOver={isGameOver}
                    isOutOfGuesses={isOutOfGuesses}
                    gameMode={gameMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Keyboard
        hints={hints}
        isOutOfGuesses={isOutOfGuesses}
        isGameOver={isGameOver}
        hasSolved={hasSolved}
        isCountdownRunning={isCountdownRunning}
        isChallengeOn={isChallengeOn}
        gameMode={gameMode}
        solution={solution}
        handleLetter={handleLetter}
        handleEnter={handleEnter}
        handleBackspace={handleBackspace}
      />
    </>
  )
}
