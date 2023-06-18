import { useState, useEffect } from "react"
import { VALID_GUESSES } from "./data/validGuesses.js"

// Components
import Header from "./components/Header"
import Keyboard from "./components/Keyboard"

// Socket
import { socket } from "./socket"

function App() {
  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  // userGuess and solution are arrays instead of strings because arrays are
  // easier to manipulate in most cases (ex. to find occurrence of a char).
  const [userGuess, setUserGuess] = useState(["", "", "", "", ""])
  const [solution, setSolution] = useState([])

  // gameBoard is not populated with strings. It's comprised of Objects with a Letter property,
  // and, as required, a Color property.
  // The colors cannot be determined all at once; the coloring algorithm takes three passes.
  // Thus, the color information has to be stored in a buffer somewhere.
  // That's why we use an Object: the color property will be stored in the Object on demand.
  const [gameBoard, setGameBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )

  // For use in Challenge Mode
  const [isChallengeMode, setIsChallengeMode] = useState(false)
  const [firstGuess, setFirstGuess] = useState(["", "", "", "", ""])
  const [greenHints, setGreenHints] = useState(["", "", "", "", ""])
  // If a user unearths 2 E's as yellow hints, he must include at least 2 E's in subsequent answers.
  // yellowHints is a hashmap that records yellow hints and their occurrence freq., ex. {E: 2}.
  const [yellowHints, setYellowHints] = useState({})

  // ! Socket states
  const [uuid, setUuid] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [isInRoom, setIsInRoom] = useState(false)
  const [otherBoard, setOtherBoard] = useState(
    new Array(6).fill().map((_) => new Array(5).fill({ letter: "" }))
  )

  // ! Socket : Connect
  // Don't put socket.on connect outside of useEffect or else it'll
  // render like 6 times :)
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")

      // Also right when you connect, grab the solution from the server
      socket.on("newSolution", (solution) => {
        console.log(`solution: ${solution}`)
        setSolution(solution)
      })
    })

    // If you remove this line it'll render twice?
    // Render twice might also be because of Strict Mode?
    return () => {
      socket.off("connect")
    }
  }, [])

  // ! Socket useEffect
  useEffect(() => {
    socket.on("userConnected", (userId) => {
      console.log(`Another user: ${userId} has connected to this lobby.`)
    })

    socket.on("matchMade", (uuid) => {
      console.log(`Match made! Setting isInRoom to TRUE so you can play now...`)
      setUuid(uuid)
      setIsInRoom(true)
    })

    // TODO: Apparently you can put this outside the useEffect and it works fine
    socket.on("revealBoard", (hiddenBoard) => {
      setOtherBoard(hiddenBoard)
    })

    // return () => {
    //   socket.off("userConnected")
    //   socket.off("revealBoard")
    // }
  }, [socket]) // TODO: with or without "socket" dependency, seems to work okay?

  // Global keyboard event listener: dependencies in 2nd param
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    // else
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentTile, isInRoom])

  // // Select random solution upon mount
  // useEffect(() => {
  //   const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase()
  //   setSolution(randomWord.split(""))
  //   console.log(randomWord)

  //   // ! For testing
  //   setIsChallengeMode(true)
  // }, [])

  // ! Challenge Mode: select a random first guess the player must adhere to.
  // The random guess will always have exactly one green character to start.
  // TODO: The current implementation also allows yellow letters, not yet sure if we want that.
  useEffect(() => {
    if (isChallengeMode) {
      while (firstGuess[0] === "") {
        const randomGuess =
          VALID_GUESSES[Math.floor(Math.random() * VALID_GUESSES.length)].toUpperCase()
        let countGreenLetters = 0
        for (let i = 0; i < randomGuess.length; ++i) {
          if (randomGuess[i] === solution[i]) {
            countGreenLetters += 1
          }
        }
        if (countGreenLetters === 1) {
          setFirstGuess(randomGuess)
          console.log(`randomGuess: ${randomGuess}`)
          // submitGuess(randomGuess)
          // update board... etc
          break
        }
      }
    }
  }, [isChallengeMode])

  /**
   *
   * HELPER FUNCTIONS
   *
   */
  function getGuessTileClassName(gameBoard, row, col) {
    let guessTileClassName = "guess__tile"

    if (!gameBoard[row][col].color) {
      if (row === currentRow && col < currentTile && !isGameOver) {
        guessTileClassName += "--active"
      }
    }
    //
    else if (gameBoard[row][col].color === "correct") {
      guessTileClassName += "--correct"
    }
    //
    else if (gameBoard[row][col].color === "wrong-position") {
      guessTileClassName += "--wrong-position"
    }
    //
    else if (gameBoard[row][col].color === "wrong") {
      guessTileClassName += "--wrong"
    }

    return guessTileClassName
  }

  // Checks if the userGuess adheres to the previous hints.
  function usesPreviousHints() {
    // Using traditional for loops here because forEach doesn't terminate upon return.
    console.log(greenHints)

    // Check adherence to green hints first
    for (let i = 0; i < userGuess.length; ++i) {
      if (greenHints[i] !== "" && userGuess[i] !== greenHints[i]) {
        return "green"
      }
    }

    // Then yellow hints.
    // Note the condition: if yellowHints is {E: 2}, the userGuess can have 3 E's, but not 1.
    for (const key in yellowHints) {
      console.log(`KEY KEY KEY : ${key}`)
      const countLettersInGuess = userGuess.filter((letter) => letter === key).length
      const countGreenLetters = userGuess.filter(
        (letter, letterIndex) => letter === key && letter === solution[letterIndex]
      ).length
      const countYellowLettersInGuess = countLettersInGuess - countGreenLetters
      console.log(`currentLetter: ${key}`)
      console.log(`countLettersInGuess: ${countLettersInGuess}`)
      console.log(`countGreenLetters: ${countGreenLetters}`)
      console.log(`countYellowLettersInGuess: ${countYellowLettersInGuess}`)
      if (yellowHints[key] > countYellowLettersInGuess) {
        return "yellow"
      }
    }

    return "okay"
  }

  // Three-pass algorithm that assigns colors based on the correctness of the userGuess and
  // transfers that information to the gameBoard.
  function updateTileColors(newGameBoard) {
    console.log(`currentRow: ${currentRow}`)
    console.log(gameBoard)

    // Create a copy of the solution as an array.
    // As we encounter letters that form part of the solution, we set
    // those indexes to null so they won't affect the remaining letters.
    let copySolution = [...solution]

    // 1: Identify greens
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      if (tile.letter === copySolution[tileIndex]) {
        newGameBoard[currentRow][tileIndex] = { ...tile, color: "correct" }
        copySolution[tileIndex] = null
      }
    })

    // 2: Identify yellows
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      // Check for existence of color property first to prevent yellows from overwriting greens
      if (!tile.color) {
        let includedIndex = copySolution.indexOf(tile.letter)
        if (includedIndex !== -1) {
          newGameBoard[currentRow][tileIndex] = { ...tile, color: "wrong-position" }
          copySolution[includedIndex] = null
        }
      }
    })

    // 3: Any remaining tiles must be wrong
    newGameBoard[currentRow].forEach((tile, tileIndex) => {
      if (!tile.color) {
        newGameBoard[currentRow][tileIndex] = { ...tile, color: "wrong" }
      }
    })

    return newGameBoard
  }

  function handleEnter() {
    // Guess is too short
    if (currentTile < 5) {
      console.log(`currentRow: ${currentRow}`)
      console.log(`Not enough letters in: ${userGuess}`)
    }
    // Guess is invalid (i.e. doesn't appear in dictionary)
    else if (!VALID_GUESSES.includes(userGuess.join("").toLowerCase())) {
      console.log(`Guess not in dictionary: ${userGuess}`)
    }
    // ! Challenge Mode: guess doesn't adhere to previous hints
    else if (isChallengeMode && usesPreviousHints() !== "okay") {
      console.log(`Not adherent to: ${usesPreviousHints()}`)
    }
    // Guess is valid: submit guess
    else {
      // Update the gameBoard's letters and colors
      const newGameBoard = [...gameBoard]
      newGameBoard[currentRow] = newGameBoard[currentRow].map((object, objectIndex) => ({
        ...object,
        letter: userGuess[objectIndex],
      }))

      const coloredGameBoard = updateTileColors(newGameBoard)
      setGameBoard(coloredGameBoard)

      // ! Challenge Mode: update the hints the player must adhere to
      const newGreenHints = [...greenHints]
      const newYellowHints = { ...yellowHints }

      coloredGameBoard[currentRow].forEach((object, objectIndex) => {
        if (object.color === "correct") {
          newGreenHints[objectIndex] = object.letter
          // Decrement yellow hints as they become green
          if (object.letter in newYellowHints && object.letter !== newGreenHints[objectIndex]) {
            newYellowHints[object.letter] -= 1
            // Cleanup the hashmap when values reach 0
            if (newYellowHints[object.letter] === 0) {
              delete newYellowHints[object.letter]
            }
          }
        }

        // The logic for yellow hints is hard to parse without examples.
        // Follow along, keeping in mind that the key property is the # of letters.
        /* 
        -- CASE 1 --
        guess: BROKE  |  yellowHints: {O: 1}  |  solution: IGLOO

        yellowHints should NOT increment, even though there is an "O"
        in BROKE that is in the wrong-position. This is because a yellow "O" has
        already been recorded by the hashmap; there is no need to duplicate it.
        In other words, the # O's in yellowHints acts as a "min".

        -- CASE 2 --
        guess: OOZES  |  yellowHints: {O: 1}  |  solution: GLOWS

        yellowHints should NOT increment, even though there are two "O"s
        in OOZES that are in the wrong-position. This is because there is only one
        "O" in the solution. In other words, the # O's in the solution acts as a "max".

        -- CASE 3 --
        guess: OOZES  |  yellowHints: {O: 1}  |  solution: IGLOO

        yellowHints SHOULD be incremented. 
        # O's in yellowHints = 1
        # O's in userGuess = 2
        # O's in solution = 2
        
        yellowHints < userGuess <= solution
            1       <     2     <=    2

        */
        else if (object.color === "wrong-position") {
          const countLettersInGuess = userGuess.filter((letter) => letter === object.letter).length
          const countLettersInYellowHints = newYellowHints[object.letter]
          const countLettersInSolution = solution.filter(
            (letter) => letter === object.letter
          ).length

          const countGreenLetters = userGuess.filter(
            (letter, letterIndex) => letter === solution[letterIndex]
          ).length
          const countYellowLettersInGuess = countLettersInGuess - countGreenLetters

          if (countYellowLettersInGuess <= countLettersInYellowHints) {
            // do nothing; does not meet min threshold
          }
          //
          else {
            if (countLettersInGuess > countLettersInSolution) {
              // do nothing; exceeds max threshold
            }
            //
            else {
              // Increment if the count is in between the min and max thresholds
              if (object.letter in newYellowHints) {
                newYellowHints[object.letter] += 1
              }
              //
              else {
                newYellowHints[object.letter] = 1
              }
            }
          }
        }
        console.log(newGreenHints)
        console.log(newYellowHints)
      })
      setGreenHints(newGreenHints)
      setYellowHints(newYellowHints)

      // Correct guess: gameOver (win)
      // Direct array comparison won't work with ===, so we must compare their string forms.
      if (userGuess.join("") === solution.join("")) {
        console.log(
          `Correct guess: guess: ${userGuess} vs. target: ${solution} \n
      You win !! Yay!`
        )
        setIsGameOver(true)
      }
      // Wrong guess
      else {
        // Run out of guesses: gameOver (loss)
        if (currentRow >= 5) {
          console.log(`game over, run out of guesses`)
          setIsGameOver(true)
        }
      }
      // Game continues: note that these states will be changed regardless of whether
      // the game is over or not. This allows the winning row to be properly rendered as well.
      setCurrentRow((currentRow) => currentRow + 1)
      setCurrentTile(0)
      setUserGuess(["", "", "", "", ""])
      console.log(`Valid guess submitted: ${userGuess}`)
      console.log(`currentRow: ${currentRow}`)
      console.log(`currentTile: ${currentTile}`)

      // ! Socket
      socket.emit("guessSubmit", uuid, coloredGameBoard)
    }
  }

  function handleBackspace() {
    if (currentTile !== 0) {
      setCurrentTile((currentTile) => currentTile - 1)

      const newGuess = [...userGuess]
      newGuess[currentTile - 1] = ""
      console.log(`user guess so far: ${newGuess}`)
      setUserGuess(newGuess)
    }
  }

  function handleLetter(letter) {
    if (currentTile < 5) {
      const newGuess = [...userGuess]
      newGuess[currentTile] = letter.toUpperCase()
      setUserGuess(newGuess)

      setCurrentTile((currentTile) => currentTile + 1)

      console.log(`user guess so far: ${newGuess}`)
      console.log(`currentTile changed from: ${currentTile} to ${currentTile + 1}`)
    }
  }

  // TODO: Is there a way to generalize these two handleKey functions?
  function handleKeyDown(e) {
    // const variable = e.key
    // handleKeyboardClick(e.key)

    const isLetterRegex = /^[a-zA-Z]$/

    if (isGameOver || !isInRoom) {
      return
    }

    if (e.key === "Enter") {
      handleEnter()
    } else if (e.key === "Backspace") {
      handleBackspace()
    } else if (isLetterRegex.test(e.key) === true) {
      handleLetter(e.key)
    }
  }

  function handleKeyboardClick(clicked) {
    if (!isGameOver) {
      if (clicked === "Enter") {
        handleEnter()
      } else if (clicked === "Backspace") {
        handleBackspace()
      } else {
        handleLetter(clicked)
      }
    }
  }

  // ! Socket : this needs to be global
  const otherGameBoards = []

  function createRoom() {
    socket.emit("createRoom", socket.id)
    socket.on("returnUuid", (uuid) => {
      console.log(`copy & paste this code to your friend: ${uuid}`)
    })
  }

  function joinRoom(e) {
    e.preventDefault()
    const pastedValue = e.clipboardData.getData("text/plain")
    socket.emit("joinRoom", pastedValue)

    socket.on("roomError", (uuid) => {
      console.log(`Error: Room "${uuid}" doesn't exist.`)
    })
  }

  // TODO: Move Keyboard events into Keyboard component
  // TODO: "Game" component that houses game logic?
  // TODO: Row and Tile components
  // TODO: Look into Context (stores) so props aren't so ugly
  return (
    <>
      <Header isChallengeMode={isChallengeMode} setIsChallengeMode={setIsChallengeMode} />

      {isInRoom ? (
        <>
          <div className="game-board">
            {gameBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="guess">
                {rowIndex === currentRow
                  ? userGuess.map((letter, index) => (
                      <div
                        key={index}
                        className={getGuessTileClassName(gameBoard, rowIndex, index)}>
                        {letter}
                      </div>
                    ))
                  : row.map((tile, tileIndex) => (
                      <div
                        key={tileIndex}
                        className={getGuessTileClassName(gameBoard, rowIndex, tileIndex)}>
                        {tile.letter}
                      </div>
                    ))}
              </div>
            ))}
          </div>

          <div className="game-board">
            {otherBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="guess">
                {row.map((tile, tileIndex) => (
                  <div
                    key={tileIndex}
                    className={getGuessTileClassName(otherBoard, rowIndex, tileIndex)}>
                    {tile.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Keyboard
            onClick={handleKeyboardClick}
            gameBoard={gameBoard}
            greenHints={greenHints}
            yellowHints={yellowHints}
          />
        </>
      ) : (
        <div>
          <button onClick={() => setShowForm((prev) => !prev)}>Join</button>
          {showForm && (
            <form onPaste={joinRoom}>
              <label>
                Enter your code here:
                <input type="text" onChange={(e) => setUuid(e.target.value)} />
              </label>
            </form>
          )}

          <button onClick={createRoom}>Create</button>
        </div>
      )}
    </>
  )
}

export default App
