import { useState, useEffect } from "react"
import axios from "axios"
import { sum } from "lodash-es"
const _ = { sum }

import { SegmentedControl } from "@mantine/core"
import classes from "./StatsPage.module.css"

import GameIcon from "../assets/game-icon.svg"
import Flame from "../assets/flame.svg?react"

function StatsPage() {
  const [userStats, setUserStats] = useState({})
  const [connectionModePath, setConnectionModePath] = useState(
    localStorage.getItem("connectionModePath") || "public"
  )
  const [gameModePath, setGameModePath] = useState(
    localStorage.getItem("gameModePath") || "normal"
  )

  useEffect(() => {
    const userId = "5bps9cZRCSMKiM362Ayo43PHmRq2"
    const statsPath = `user/${userId}/${connectionModePath}/${gameModePath}`
    console.log(`statsPath: ${statsPath}`)

    // TODO: Change to production URL.
    // TODO: Would like to use await syntax, but useEffect can't be async.
    axios.get(`http://localhost:3005/${statsPath}`).then((res) => {
      console.log(res.data)
      // TODO: Careful here: if res.data is undefined, you'll be rendering a bunch of undefined as we're calling the properties directly. Need better error checking.
      setUserStats(res.data)
    })
  }, [connectionModePath, gameModePath])

  function changeConnectionModePath(value) {
    localStorage.setItem("connectionModePath", value)
    setConnectionModePath(value)
  }

  function changeGameModePath(value) {
    localStorage.setItem("gameModePath", value)
    setGameModePath(value)
  }

  return (
    <>
      <SegmentedControl
        radius="md"
        size="default"
        value={connectionModePath}
        data={[
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
        ]}
        classNames={classes}
        onChange={changeConnectionModePath}
      />
      <SegmentedControl
        radius="md"
        size="default"
        value={gameModePath}
        data={[
          { value: "normal", label: "Normal" },
          { value: "challenge", label: "Challenge" },
        ]}
        classNames={classes}
        onChange={changeGameModePath}
      />
      <div
        style={{
          fontSize: "3rem",
          fontWeight: "800",
        }}
      >
        Goldjet
      </div>
      <div style={{ fontSize: "1.5rem", fontStyle: "italic" }}>
        -- the RECKLESS --
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "5rem",
          border: "0.7rem solid black",
          borderRadius: "50%",
        }}
      >
        <Flame width="5rem" height="5rem" color="red" />
        {userStats.maxStreak}
      </div>
      <h3>Games</h3>
      <div style={{ fontSize: "2rem" }}>
        <img src={GameIcon} width="25rem" alt="GameIcon" />
        &nbsp;
        {userStats.totalGames}
      </div>
      <div>! insert win % / loss % bar here !</div>
      <div>
        {userStats.totalWins} Wins {userStats.totalGames - userStats.totalWins}{" "}
        Losses
      </div>
      <h3>Guesses</h3>
      {userStats.solveDistribution?.map((solve, index) => (
        <div key={index}>
          {index + 1}: {solve}
        </div>
      ))}
      <h3>Others</h3>
      <div>
        Average Solve Time:{" "}
        {(
          userStats.totalSolveTime / _.sum(userStats.solveDistribution)
        ).toFixed(2)}
      </div>
      <div>
        Average Guesses:{" "}
        {(userStats.totalGuesses / userStats.totalGames).toFixed(2)}
      </div>

      <div># Out of Guesses: {userStats.totalOOG}</div>
    </>
  )
}

export default StatsPage
