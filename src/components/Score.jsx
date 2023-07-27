import React from "react"
import { useState, useEffect } from "react"
import { socket } from "../socket"

// gameMode
// "online-public" w/ strangers
// "online-private" w/ friends

function Score({ isGameOver, gameMode }) {
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    socket.on("updateScoreLoser", () => {
      if (gameMode === "online-public") {
        setStreak(0)
      } else {
        setPoints(0)
      }
    })

    socket.on("updateScoreWinner", (socketId) => {
      console.log(socketId)

      if (gameMode === "online-public") {
        setStreak((prev) => prev + 1)
      } else {
        setPoints((prev) => prev + 1)
      }
    })

    return () => {
      setPoints(0)
      setStreak(0)

      socket.off("updateScoreLoser")
      socket.off("updateScoreWinner")
    }
  }, [isGameOver])

  return <div> {gameMode === "online-public" ? streak : points} </div>

  // based on gameMode state, if gameMode = online-public -> display streak, else display points
}

{
  /* 
{gameBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="guess">
            {rowIndex === currentRow
              ? userGuess.map((letter, index) => (
                  <div key={index} className={getGuessTileClassName(gameBoard, rowIndex, index)}>
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
          </div> */
}

export default Score
