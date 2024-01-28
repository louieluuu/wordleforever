import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Confetti from "react-confetti"
import socket from "../socket"
import useSetRoomId from "../helpers/useSetRoomId"
import { LuClock12 } from "react-icons/lu"

// Components
import CountdownModal from "./CountdownModal"
import GameBoardContainer from "./GameBoardContainer"
import Keyboard from "./Keyboard"

// Data
import VALID_WORDS from "../data/validWords"
import WORDLE_ANSWERS from "../data/wordleAnswers"
import WIN_MESSAGES from "../data/winMessages"
import PostGameDialog from "./PostGameDialog"

function GameContainer({
  isChallengeOn,
  connectionMode,
  isHost,
  setIsHost,
  isSpectating,
  setIsSpectating,
  setRoomId,
}) {
  useSetRoomId(setRoomId)

  // Gameflow states
  const [hasSolved, setHasSolved] = useState(false)
  const [isOutOfGuesses, setIsOutOfGuesses] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [numberOfPieces, setNumberOfPieces] = useState(0)
  const [isConfettiRunning, setIsConfettiRunning] = useState(false)

  // Gameplay states
  const [board, setBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" }))
  )
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [activeCellIndex, setActiveCellIndex] = useState(0)
  const [submittedGuesses, setSubmittedGuesses] = useState([])
  const [hints, setHints] = useState({
    green: new Set(),
    yellow: new Set(),
    grey: new Set(),
  })

  // Alert states
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Solution
  const [solution, setSolution] = useState("")

  // Online states
  const { roomId } = useParams()
  const [userInfo, setUserInfo] = useState([])
  const [challengeModeGuess, setChallengeModeGuess] = useState(null)
  const [isCountdownRunning, setIsCountdownRunning] = useState(false)
  const [hasOnlineGameStarted, setHasOnlineGameStarted] = useState(false)
  const [isKeyboardLocked, setIsKeyboardLocked] = useState(false)
  const [winningUserId, setWinningUserId] = useState("")

  // Private game states
  const [isMatchOver, setIsMatchOver] = useState(false)
  const [roundCounter, setRoundCounter] = useState(0)
  const [maxRounds, setMaxRounds] = useState(0)
  const [roundTimer, setRoundTimer] = useState(0)
  const [timerIndex, setTimerIndex] = useState(0)
  const [showPostGameDialog, setShowPostGameDialog] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(true)

  // Spectator states
  const [spectatorMessage, setSpectatorMessage] = useState("")
  const [hiddenPeriods, setHiddenPeriods] = useState("")
  const [messageIndex, setMessageIndex] = useState(0)

  // Audio
  const wrongGuess = new Audio("/src/assets/guess-wrong.mp3")
  const firstCorrectGuess = new Audio("/src/assets/guess-first-correct.mp3")

  // useEffect hooks

  // Run once when the component mounts
  useEffect(() => {
    if (isSpectating) {
      socket.emit("gameJoinedInProgress", roomId)
      setHasOnlineGameStarted(true)
    } else {
      startNewGame()
    }
  }, [])

  // Generate and set challenge mode guess in offline mode
  useEffect(() => {
    if (connectionMode === "offline" && isChallengeOn && solution !== "") {
      generateRandomFirstGuess(solution)
    }
  }, [solution])

  // Set the challenge mode guess in online mode (only colorize after the countdown is finished)
  useEffect(() => {
    if (
      typeof connectionMode === "string" &&
      connectionMode.includes("online") &&
      isChallengeOn &&
      solution !== "" &&
      challengeModeGuess !== null
    ) {
      if (isCountdownRunning) {
        displayGuess(challengeModeGuess)
      } else {
        setUserGuess(challengeModeGuess)
      }
    }
  }, [isCountdownRunning, solution])

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

  useEffect(() => {
    if (isCountdownRunning) {
      setIsSpectating(false)
    }
  }, [isCountdownRunning])

  // Online game flow

  // This runs on component mount and always listens for the "gameStarted" socket event
  // The states set here need to already be set for the rest of the game logic, so we can't run the other socket events in this useEffect
  // Instead we will set hasOnlineGameStarted, and have our main useEffect loop have that as a dependency -> it will run once the initial states are set
  useEffect(() => {
    socket.on(
      "gameStarted",
      (
        initialUserInfo,
        newSolution,
        newChallengeModeGuess,
        maxRounds,
        round,
        timer
      ) => {
        setHasOnlineGameStarted(true)
        resetStates()
        const sortedUserInfo = initialUserInfo.sort((obj) => {
          return obj.userId === socket.id ? -1 : 1
        })
        setUserInfo(sortedUserInfo)
        setSolution(newSolution)
        setChallengeModeGuess(newChallengeModeGuess)
        setIsCountdownRunning(true)
        setMaxRounds(maxRounds)
        setRoundCounter(round)
        setRoundTimer(timer)
      }
    )

    return () => {
      socket.off("gameStarted")
    }
  }, [])

  // Main useEffect loop for online game logic
  useEffect(() => {
    if (hasOnlineGameStarted) {
      socket.on("spectatorInfo", (allUserInfo, maxRounds, round, timer) => {
        setUserInfo(allUserInfo)
        setMaxRounds(maxRounds)
        setRoundCounter(round)
        setRoundTimer(timer)
      })

      socket.on("timerTick", (timer) => {
        setRoundTimer(timer)
        setTimerIndex(timer % 4)
      })

      socket.on("gameBoardsUpdated", (updatedUserId, updatedBoard) => {
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId !== socket.id && obj.userId === updatedUserId) {
              if (isSpectating) {
                obj.gameBoard = updatedBoard
              } else {
                obj.gameBoard = hideGuess(updatedBoard)
              }
            }
          })
          return updatedUserInfo
        })
      })

      socket.on("pointsUpdated", (updatedUserId, updatedPoints) => {
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId === updatedUserId) {
              obj.points = updatedPoints
            }
          })
          return updatedUserInfo
        })
      })

      socket.on("streakUpdated", (updatedUserId, updatedStreak) => {
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId === updatedUserId) {
              obj.streak = updatedStreak
            }
          })
          return updatedUserInfo
        })
      })

      socket.on("firstSolve", (firstSolveUserId, roundsWon) => {
        setWinningUserId(firstSolveUserId)
        if (socket.id === firstSolveUserId) {
          showWinAnimations()
        }
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId === firstSolveUserId) {
              obj.roundsWon = roundsWon
            }
          })
          return updatedUserInfo
        })
      })

      socket.on("totalGuessesUpdated", (updatedUserId, updatedTotalGuesses) => {
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId === updatedUserId) {
              obj.totalGuesses = updatedTotalGuesses
            }
          })
          return updatedUserInfo
        })
      })

      socket.on("roundsSolvedUpdated", (updatedUserId, updatedRoundsSolved) => {
        setUserInfo((prevUserInfo) => {
          const updatedUserInfo = [...prevUserInfo]
          updatedUserInfo.forEach((obj) => {
            if (obj.userId === updatedUserId) {
              obj.totalGuesses = updatedRoundsSolved
            }
          })
          return updatedUserInfo
        })
      })

      socket.on(
        "totalTimeInRoundsSolvedUpdated",
        (updatedUserId, updatedTotalTimeInRoundsSolved) => {
          setUserInfo((prevUserInfo) => {
            const updatedUserInfo = [...prevUserInfo]
            updatedUserInfo.forEach((obj) => {
              if (obj.userId === updatedUserId) {
                obj.totalTimeInRoundsSolved = updatedTotalTimeInRoundsSolved
              }
            })
            return updatedUserInfo
          })
        }
      )

      socket.on("finalUserInfo", (finalUserInfo) => {
        const sortedUserInfo = finalUserInfo.sort((obj) => {
          return obj.userId === socket.id ? -1 : 1
        })
        setUserInfo(sortedUserInfo)
        setIsGameOver(true)
        setHasOnlineGameStarted(false)
      })

      return () => {
        socket.off("spectatorInfo")
        socket.off("timerTick")
        socket.off("gameBoardsUpdated")
        socket.off("pointsUpdated")
        socket.off("streakUpdated")
        socket.off("firstSolve")
        socket.off("totalGuessesUpdated")
        socket.off("roundsSolvedUpdated")
        socket.off("totalTimeInRoundsSolvedUpdated")
        socket.off("finalUserInfo")
      }
    }
  }, [hasOnlineGameStarted])

  // These can't be in the main useEffect loop, as they need to happen outside of hasOnlineGameStarted logic (post round in private games)
  useEffect(() => {
    socket.on("newHost", (newHostId) => {
      if (socket.id === newHostId) {
        setIsHost(true)
      }
    })

    socket.on("endOfMatch", () => {
      setIsMatchOver(true)
      setShowPostGameDialog(true)
    })

    return () => {
      socket.off("newHost")
      socket.off("endOfMatch")
    }
  })

  // Display solution as an alert
  useEffect(() => {
    if (isGameOver && !hasSolved && !isSpectating) {
      displaySolution()
    }
  }, [isGameOver, hasSolved])

  // Lock the keyboard for half a second when the game is finished (prevent accidental new game start)
  useEffect(() => {
    if (isGameOver) {
      setIsKeyboardLocked(true)
      const keyboardTimeout = setTimeout(() => {
        setIsKeyboardLocked(false)
      }, 500)
    }
  }, [isGameOver])

  // Cycle through trailing periods for spectator message
  useEffect(() => {
    const cycle = setInterval(() => {
      setMessageIndex((prevMessageIndex) => (prevMessageIndex + 1) % 4)
    }, 1000)

    return () => clearInterval(cycle)
  }, [])

  // Set spectator message and corresponding remaining periods (which are hidden for styling)
  useEffect(() => {
    setSpectatorMessage(SPECTATOR_MESSAGES[messageIndex])
    setHiddenPeriods(HIDDEN_PERIODS[messageIndex])
  }, [messageIndex])

  const SPECTATOR_MESSAGES = [
    "Joining next round",
    "Joining next round.",
    "Joining next round..",
    "Joining next round...",
  ]

  const HIDDEN_PERIODS = ["...", "..", ".", ""]

  // Helper functions

  function startNewGame() {
    if (
      typeof connectionMode === "string" &&
      connectionMode.includes("online")
    ) {
      socket.emit("loadUser", roomId)
    } else if (connectionMode === "offline") {
      resetStates()
      const newSolution = generateSolution()
      setSolution(newSolution)
    }
    console.log("Starting game with", connectionMode, isChallengeOn)
  }

  function resetStates() {
    setIsGameOver(false)
    setIsMatchOver(false)
    setHasSolved(false)
    setIsOutOfGuesses(false)
    setBoard(
      new Array(6)
        .fill()
        .map((_) => new Array(5).fill({ letter: "", color: "" }))
    )
    setActiveRowIndex(0)
    setActiveCellIndex(0)
    setSubmittedGuesses([])
    setHints({ green: new Set(), yellow: new Set(), grey: new Set() })
    setShowAlertModal(false)
    setIsConfettiRunning(false)
    setIsSpectating(false)
  }

  function handleLetter(e) {
    if (activeRowIndex < board.length) {
      const updatedBoard = board.map((row, rowIndex) => {
        if (rowIndex === activeRowIndex) {
          return row.map((cell, cellIndex) => {
            if (
              cellIndex === activeCellIndex &&
              board[activeRowIndex][activeCellIndex].letter === ""
            ) {
              return { ...cell, letter: e.toUpperCase() }
            } else {
              return cell
            }
          })
        } else {
          return row
        }
      })

      if (activeCellIndex === updatedBoard[activeRowIndex].length) {
        return
      }

      setBoard(updatedBoard)
      setActiveCellIndex(activeCellIndex + 1)
    }
  }

  function handleBackspace() {
    const updatedBoard = [...board]
    if (
      activeCellIndex === updatedBoard[activeRowIndex].length - 1 &&
      updatedBoard[activeRowIndex][activeCellIndex].letter !== ""
    ) {
      updatedBoard[activeRowIndex][activeCellIndex] = {
        ...updatedBoard[activeRowIndex][activeCellIndex],
        letter: "",
      }
      setBoard(updatedBoard)
    } else if (activeCellIndex > 0) {
      updatedBoard[activeRowIndex][activeCellIndex - 1] = {
        ...updatedBoard[activeRowIndex][activeCellIndex - 1],
        letter: "",
      }
      setActiveCellIndex(activeCellIndex - 1)
      setBoard(updatedBoard)
    }
  }

  function handleEnter() {
    const enteredWord = board[activeRowIndex]
      .filter((cell) => cell.letter !== "")
      .map((cell) => cell.letter)
      .join("")
      .toUpperCase()

    if (validateUserGuess(enteredWord)) {
      setUserGuess(enteredWord)
    }
  }

  function validateUserGuess(guess) {
    if (guess.length < 5) {
      setAlertMessage("Not enough letters")
      setShowAlertModal(true)
      return false
    } else if (!VALID_WORDS.includes(guess.toLowerCase())) {
      setAlertMessage("Not in word list")
      setShowAlertModal(true)
      return false
    } else if (isChallengeOn && !usesPreviousHints(guess).isValid) {
      if (usesPreviousHints(guess).failCondition.color === "green") {
        const index = usesPreviousHints(guess).failCondition.index
        const letter = usesPreviousHints(guess).failCondition.letter
        setAlertMessage(
          `The ${index}${getSuffix(index)} letter must be ${letter}`
        )
        setShowAlertModal(true)
        return false
      } else {
        const letter = usesPreviousHints(guess).failCondition.letter
        setAlertMessage(`'${letter}' must be included in the solution`)
        setShowAlertModal(true)
        return false
      }
    }

    return true
  }

  function displayGuess(guess) {
    let uncolorizedGuess = new Array(5).fill({ letter: "", color: "" })
    for (let i = 0; i < guess.length; i++) {
      uncolorizedGuess[i] = { letter: guess[i] }
    }
    const updatedBoard = board.map((row) => [...row])
    updatedBoard[activeRowIndex] = uncolorizedGuess
    setBoard(updatedBoard)
  }

  function setUserGuess(guess) {
    const colorizedGuess = assignColors(guess)
    const updatedBoard = board.map((row) => [...row])
    updatedBoard[activeRowIndex] = colorizedGuess
    setBoard(updatedBoard)
    updateHints(colorizedGuess)

    if (guess === solution) {
      setHasSolved(true)
      if (
        typeof connectionMode === "string" &&
        connectionMode.includes("online")
      ) {
        socket.emit("correctGuess", roomId, updatedBoard)
        if (
          typeof connectionMode === "string" &&
          connectionMode === "online-public"
        ) {
          showWinAnimations()
        }
      }
      if (connectionMode === "offline") {
        setIsGameOver(true)
        showWinAnimations()
      }
    } else {
      playAudio(wrongGuess)
      if (
        typeof connectionMode === "string" &&
        connectionMode.includes("online")
      ) {
        socket.emit("wrongGuess", roomId, updatedBoard)
      }
      setSubmittedGuesses([...submittedGuesses, activeRowIndex])
      const nextRow = activeRowIndex + 1
      setActiveRowIndex(nextRow)
      setActiveCellIndex(0)
      if (nextRow >= board.length) {
        setIsOutOfGuesses(true)
        if (connectionMode === "offline") {
          setIsGameOver(true)
        } else if (connectionMode === "online-public") {
          socket.emit("outOfGuesses", roomId)
          setIsGameOver(true)
        } else if (connectionMode === "online-private") {
          socket.emit("outOfGuesses", roomId)
        }
      }
    }
  }

  function assignColors(guess) {
    let colorizedGuess = new Array(5).fill({ letter: "", color: "" })
    let solutionArray = [...solution]

    // Assign greens (correct letter in correct spot)
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      if (letter === solution[i]) {
        colorizedGuess[i] = { letter: letter, color: "green" }
        solutionArray[i] = null
      }
    }

    // Assign yellows (correct letter in wrong spot)
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      // Don't overwrite already assigned greens
      if (colorizedGuess[i].color !== "green") {
        let includedIndex = solutionArray.indexOf(letter)
        if (includedIndex !== -1) {
          colorizedGuess[i] = { letter: letter, color: "yellow" }
          solutionArray[includedIndex] = null
        }
      }
    }

    // Assign greys (letter not in solution)
    colorizedGuess.forEach((cell, cellIndex) => {
      if (!cell.color) {
        colorizedGuess[cellIndex] = { letter: guess[cellIndex], color: "grey" }
      }
    })

    return colorizedGuess
  }

  // Used to color the keyboard tiles + for hard / challenge mode
  function updateHints(colorizedGuess) {
    const updatedGreenHints = new Set(hints.green)
    const updatedYellowHints = new Set(hints.yellow)
    const updatedGreyHints = new Set(hints.grey)

    colorizedGuess.forEach((cell) => {
      if (cell.color === "green") {
        updatedGreenHints.add(cell.letter)
      } else if (cell.color === "yellow") {
        updatedYellowHints.add(cell.letter)
      } else if (cell.color === "grey") {
        updatedGreyHints.add(cell.letter)
      }
    })

    const newHints = {
      green: updatedGreenHints,
      yellow: updatedYellowHints,
      grey: updatedGreyHints,
    }
    setHints(newHints)
  }

  // Used for hard / challenge mode
  function usesPreviousHints(currentGuess) {
    let result = {
      isValid: true,
      failCondition: null,
    }

    // Base case
    if (activeRowIndex === 0) {
      return result
    }

    let currentGuessArray = [...currentGuess]
    let previousGuessCopy = [...board[activeRowIndex - 1]]

    for (let i = 0; i < previousGuessCopy.length; i++) {
      if (previousGuessCopy[i].color === "green") {
        if (currentGuessArray[i] !== previousGuessCopy[i].letter) {
          result.isValid = false
          result.failCondition = {
            color: "green",
            letter: previousGuessCopy[i].letter,
            index: i + 1,
          }
          return result
        }
        currentGuessArray[i] = ""
      }
    }

    for (let i = 0; i < previousGuessCopy.length; i++) {
      if (previousGuessCopy[i].color === "yellow") {
        let includedIndex = currentGuessArray.indexOf(
          previousGuessCopy[i].letter
        )
        if (includedIndex === -1) {
          result.isValid = false
          result.failCondition = {
            color: "yellow",
            letter: previousGuessCopy[i].letter,
          }
          return result
        }
        currentGuessArray[includedIndex] = null
      }
    }

    return result
  }

  function hideGuess(updatedBoard) {
    const noLettersBoard = updatedBoard.map((row) =>
      row.map((cell) => ({ ...cell, letter: "" }))
    )
    return noLettersBoard
  }

  function generateSolution() {
    const newSolution =
      WORDLE_ANSWERS[
        Math.floor(Math.random() * WORDLE_ANSWERS.length)
      ].toUpperCase()
    console.log("Solution is", newSolution)
    return newSolution
  }

  // Used for challenge mode, generates a random starting word that always has exactly one letter in the correct spot
  function generateRandomFirstGuess(solution) {
    let randomFirstGuess
    while (true) {
      randomFirstGuess =
        VALID_WORDS[
          Math.floor(Math.random() * VALID_WORDS.length)
        ].toUpperCase()
      let numGreenLetters = 0
      for (let i = 0; i < randomFirstGuess.length; i++) {
        if (randomFirstGuess[i] === solution[i]) {
          numGreenLetters += 1
        }
      }
      if (numGreenLetters === 1) {
        setUserGuess(randomFirstGuess)
        return randomFirstGuess
      }
    }
  }

  function showWinAnimations() {
    const winMessage =
      WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
    setAlertMessage(winMessage)
    setShowAlertModal(true)
    setIsConfettiRunning(true)
    playAudio(firstCorrectGuess)
  }

  function playAudio(audioObject) {
    audioObject.play()
  }

  function displaySolution() {
    setAlertMessage(solution)
    setShowAlertModal(true)
  }

  // Could be generalized but no need for this game since the solution will always be 5 letters
  function getSuffix(number) {
    switch (number) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return (
    <>
      <div className={`upper-game-container${isSpectating ? "--spec" : ""}`}>
        {isCountdownRunning && (
          <CountdownModal
            isCountdownRunning={isCountdownRunning}
            setIsCountdownRunning={setIsCountdownRunning}
            connectionMode={connectionMode}
            maxRounds={maxRounds}
            roundCounter={roundCounter}
          />
        )}
        {isConfettiRunning && (
          <Confetti numberOfPieces={numberOfPieces} initialVelocityY={-10} />
        )}
        {connectionMode === "online-private" && roundCounter !== 0 && (
          <div className="private-room-info">
            <span className="timer">
              <span className="clock">
                <LuClock12
                  style={{
                    transform: `rotate(${360 - timerIndex * 90}deg)`,
                  }}
                />
                &nbsp;
              </span>
              {roundTimer}
            </span>
            <span className="round-counter">
              Round: {roundCounter}/{maxRounds}
            </span>
          </div>
        )}
        <GameBoardContainer
          connectionMode={connectionMode}
          board={board}
          activeRow={activeRowIndex}
          activeCell={activeCellIndex}
          userInfo={userInfo}
          isOutOfGuesses={isOutOfGuesses}
          isSpectating={isSpectating}
          isGameOver={isGameOver}
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          message={alertMessage}
          hasSolved={hasSolved}
          isConfettiRunning={isConfettiRunning}
          winningUserId={winningUserId}
        />
      </div>

      {!isSpectating ? (
        <div className="lower-game-container">
          {showPostGameDialog && (
            <PostGameDialog
              setShowPostGameDialog={setShowPostGameDialog}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              userInfo={userInfo}
              maxRounds={maxRounds}
            />
          )}
          <Keyboard
            handleLetter={handleLetter}
            handleBackspace={handleBackspace}
            handleEnter={handleEnter}
            hints={hints}
            isCountdownRunning={isCountdownRunning}
            isGameOver={isGameOver}
            isMatchOver={isMatchOver}
            hasSolved={hasSolved}
            isOutOfGuesses={isOutOfGuesses}
            isChallengeOn={isChallengeOn}
            connectionMode={connectionMode}
            isHost={isHost}
            startNewGame={startNewGame}
            isKeyboardLocked={isKeyboardLocked}
            showPostGameDialog={showPostGameDialog}
            setShowPostGameDialog={setShowPostGameDialog}
          />
        </div>
      ) : (
        <div className="lower-game-container--spec">
          <div className="spectator-message">
            {spectatorMessage}
            <span className="hidden-periods">{hiddenPeriods}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default GameContainer
