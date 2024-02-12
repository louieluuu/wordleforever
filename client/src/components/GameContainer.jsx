import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Confetti from "react-confetti"
import socket from "../socket"
import useSetRoomId from "../helpers/useSetRoomId"

// Components
import CountdownModal from "./CountdownModal"
import GameBoardContainer from "./GameBoardContainer"
import Keyboard from "./Keyboard"
import PostGameDialog from "./PostGameDialog"
import PrivateRoomInfo from "./PrivateRoomInfo"

// Data
import VALID_WORDS from "../data/validWords"
import WORDLE_ANSWERS from "../data/wordleAnswers"
import WIN_MESSAGES from "../data/winMessages"

// Audio
import { Howl } from "howler"

import gameOverWebm from "../assets/audio/webm/game-over.webm"
import guess0Webm from "../assets/audio/webm/guess-0.webm"
import guess1Webm from "../assets/audio/webm/guess-1.webm"
import guess2Webm from "../assets/audio/webm/guess-2.webm"
import guess3Webm from "../assets/audio/webm/guess-3.webm"
import guess4Webm from "../assets/audio/webm/guess-4.webm"
import guessInvalidWebm from "../assets/audio/webm/guess-invalid.webm"
import opponentSolveWebm from "../assets/audio/webm/opponent-solve.webm"
import solveWebm from "../assets/audio/webm/solve.webm"
import timerLowWebm from "../assets/audio/webm/timer-low.webm"
import winMatchWebm from "../assets/audio/webm/win-match.webm"
import winRoundWebm from "../assets/audio/webm/win-round.webm"

import gameOverMp3 from "../assets/audio/mp3/game-over.mp3"
import guess0Mp3 from "../assets/audio/mp3/guess-0.mp3"
import guess1Mp3 from "../assets/audio/mp3/guess-1.mp3"
import guess2Mp3 from "../assets/audio/mp3/guess-2.mp3"
import guess3Mp3 from "../assets/audio/mp3/guess-3.mp3"
import guess4Mp3 from "../assets/audio/mp3/guess-4.mp3"
import guessInvalidMp3 from "../assets/audio/mp3/guess-invalid.mp3"
import opponentSolveMp3 from "../assets/audio/mp3/opponent-solve.mp3"
import solveMp3 from "../assets/audio/mp3/solve.mp3"
import timerLowMp3 from "../assets/audio/mp3/timer-low.mp3"
import winMatchMp3 from "../assets/audio/mp3/win-match.mp3"
import winRoundMp3 from "../assets/audio/mp3/win-round.mp3"

// TODO: Placement of these?
const audioGuesses = [
  new Howl({ src: [guess0Webm, guess0Mp3] }),
  new Howl({ src: [guess1Webm, guess1Mp3] }),
  new Howl({ src: [guess2Webm, guess2Mp3] }),
  new Howl({ src: [guess3Webm, guess3Mp3] }),
  new Howl({ src: [guess4Webm, guess4Mp3] }),
]

const audioGuessInvalid = new Howl({ src: [guessInvalidWebm, guessInvalidMp3] })
const audioGameOver = new Howl({ src: [gameOverWebm, gameOverMp3] })
const audioOpponentSolve = new Howl({
  src: [opponentSolveWebm, opponentSolveMp3],
})
const audioSolve = new Howl({ src: [solveWebm, solveMp3] })
const audioTimerLow = new Howl({ src: [timerLowWebm, timerLowMp3] })
const audioWinMatch = new Howl({ src: [winMatchWebm, winMatchMp3] })
const audioWinRound = new Howl({ src: [winRoundWebm, winRoundMp3] })

function GameContainer({
  isChallengeOn,
  connectionMode,
  isHost,
  setIsHost,
  isSpectating,
  setIsSpectating,
  setRoomId,
  isPhoneLayout,
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
  const [userInfoSortedByPoints, setUserInfoSortedByPoints] = useState([])
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
      isOnline(connectionMode) &&
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
      socket.on("spectatorInfo", (gameUserInfo, maxRounds, round, timer) => {
        setUserInfo(gameUserInfo)
        setMaxRounds(maxRounds)
        setRoundCounter(round)
        setRoundTimer(timer)
      })

      socket.on("timerTick", (timer) => {
        setRoundTimer(timer)
        setTimerIndex(timer % 4)

        if (timer !== 0 && timer <= 15) {
          playAudio(audioTimerLow)
        }
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

      socket.on("firstSolve", (firstSolveUserId) => {
        setWinningUserId(firstSolveUserId)

        // TODO anywhere that says "socket.id" must be audited,
        // because it should actually be userId - which is
        // either Firebase's auth userId or socket.id.
        if (socket.id === firstSolveUserId) {
          handleWin()
        }
      })

      socket.on("opponentSolvedAudio", () => {
        playAudio(audioOpponentSolve)
      })

      socket.on("endOfGameInfo", (endOfGameUserInfo, isMatchOver) => {
        if (!isOutOfGuesses && !hasSolved) {
          playAudio(audioGameOver)
        }

        // Used to sort the users so the client's board always shows first.
        // For displaying on the game boards.
        const sortedUserInfo = endOfGameUserInfo.sort((obj) => {
          return obj.userId === socket.id ? -1 : 1
        })

        setUserInfo(sortedUserInfo)
        setIsGameOver(true)
        setHasOnlineGameStarted(false)
        if (isMatchOver) {
          setIsMatchOver(true)
        }
      })

      return () => {
        socket.off("spectatorInfo")
        socket.off("timerTick")
        socket.off("gameBoardsUpdated")
        socket.off("pointsUpdated")
        socket.off("streakUpdated")
        socket.off("firstSolve")
        socket.off("opponentSolvedAudio")
        socket.off("endOfGameInfo")
      }
    }
  }, [hasOnlineGameStarted, isOutOfGuesses, hasSolved]) // LOUIE: added dep

  // These can't be in the main useEffect loop, as they need to happen outside of hasOnlineGameStarted logic (post round in private games)
  useEffect(() => {
    socket.on("newHost", (newHostId) => {
      if (socket.id === newHostId) {
        setIsHost(true)
      }
    })

    return () => {
      socket.off("newHost")
    }
  }, [])

  useEffect(() => {
    if (isGameOver && isMatchOver && connectionMode === "private") {
      // Used to sort the users by points.
      // To be passed in for rendering the PostGameDialog leaderboard.
      const copyUserInfo = [...userInfo]
      const sortedByPoints = copyUserInfo.sort((a, b) => b.points - a.points)

      if (socket.id === sortedByPoints[0].userId) {
        playAudio(audioWinMatch)
      }

      setUserInfoSortedByPoints(sortedByPoints)
      setShowPostGameDialog(true)
    }
  }, [isGameOver, isMatchOver])

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

  function isOnline(connectionMode) {
    return connectionMode === "public" || connectionMode === "private"
  }

  function startNewGame() {
    if (isOnline(connectionMode)) {
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
    setShowPostGameDialog(false)
    setShowScoreboard(true)
    setWinningUserId("")
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
      playAudio(audioGuessInvalid)
      setAlertMessage("Not enough letters")
      setShowAlertModal(true)
      return false
    } else if (!VALID_WORDS.includes(guess.toLowerCase())) {
      playAudio(audioGuessInvalid)
      setAlertMessage("Not in word list")
      setShowAlertModal(true)
      return false
    } else if (isChallengeOn && !usesPreviousHints(guess).isValid) {
      if (usesPreviousHints(guess).failCondition.color === "green") {
        playAudio(audioGuessInvalid)
        const index = usesPreviousHints(guess).failCondition.index
        const letter = usesPreviousHints(guess).failCondition.letter
        setAlertMessage(
          `The ${index}${getSuffix(index)} letter must be ${letter}`
        )
        setShowAlertModal(true)
        return false
      } else {
        const letter = usesPreviousHints(guess).failCondition.letter
        playAudio(audioGuessInvalid)
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
      if (isOnline(connectionMode)) {
        socket.emit("correctGuess", roomId, updatedBoard)
        if (typeof connectionMode === "string" && connectionMode === "public") {
          handleWin()
        }
        if (
          typeof connectionMode === "string" &&
          connectionMode === "private"
        ) {
          if (winningUserId && socket.id !== winningUserId) {
            playAudio(audioSolve)
          }
        }
      }
      if (connectionMode === "offline") {
        setIsGameOver(true)
        handleWin()
      }
    } else {
      if (isOnline(connectionMode)) {
        socket.emit("wrongGuess", roomId, updatedBoard)
      }
      setSubmittedGuesses([...submittedGuesses, activeRowIndex])
      const nextRow = activeRowIndex + 1
      setActiveRowIndex(nextRow)
      setActiveCellIndex(0)
      if (nextRow >= board.length) {
        setIsOutOfGuesses(true)
        playAudio(audioGameOver)
        if (connectionMode === "offline") {
          setIsGameOver(true)
        } else if (connectionMode === "public") {
          socket.emit("outOfGuesses", roomId)
          setIsGameOver(true)
        } else if (connectionMode === "private") {
          socket.emit("outOfGuesses", roomId)
        }
      } else {
        playAudio(audioGuesses[activeRowIndex])
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

  function playAudio(howlObject) {
    howlObject.play()
  }

  function handleWin() {
    const winMessage =
      WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
    setAlertMessage(winMessage)
    setShowAlertModal(true)
    setIsConfettiRunning(true)
    playAudio(audioWinRound)
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
            playAudio={playAudio}
          />
        )}
        {isConfettiRunning && (
          <Confetti numberOfPieces={numberOfPieces} initialVelocityY={-10} />
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
          isPhoneLayout={isPhoneLayout}
        />
        <PrivateRoomInfo
          connectionMode={connectionMode}
          roundCounter={roundCounter}
          timerIndex={timerIndex}
          roundTimer={roundTimer}
          maxRounds={maxRounds}
          isGameOver={isGameOver}
          hasSolved={hasSolved}
          playAudio={playAudio}
        />
      </div>

      {!isSpectating ? (
        <div className="lower-game-container">
          {showPostGameDialog && (
            <PostGameDialog
              setShowPostGameDialog={setShowPostGameDialog}
              showScoreboard={showScoreboard}
              setShowScoreboard={setShowScoreboard}
              userInfoSortedByPoints={userInfoSortedByPoints}
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
            playAudio={playAudio}
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
