import { useState, useEffect } from "react"
import axios from "axios"
import { isEmpty, sum } from "lodash-es"
const _ = { isEmpty, sum }

import { Divider, SegmentedControl } from "@mantine/core"
import classes from "./StatsPage.module.css"

import StatsBar from "./StatsBar"
import StatsDistribution from "./StatsDistribution"

import GameIcon from "../assets/game-icon.svg"
import Streak from "./Streak"

import Stopwatch from "./Stopwatch"

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
      {_.isEmpty(userStats) ? (
        <div>LOADING...</div>
      ) : (
        <div className="stats-container">
          {/* <StatsBar
            totalGames={userStats.totalGames}
            wins={userStats.totalWins}
            losses={userStats.totalGames - userStats.totalWins}
          /> */}

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

          <Stopwatch
            time={userStats.totalSolveTime / _.sum(userStats.solveDistribution)}
          />

          <Divider
            label={
              <div style={{ color: "black", fontSize: "1.25rem" }}>Games</div>
            }
            orientation="vertical"
            color="gray.6"
          />

          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
            <img src={GameIcon} width="25rem" alt="GameIcon" />
            &nbsp;
            {userStats.totalGames}
          </div>
          <div style={{ fontSize: "3rem", fontWeight: "bold" }}>
            {userStats.totalWins} Wins
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "5rem",
              border: "0.5rem solid black",
              borderRadius: "50%",
              padding: "1rem",
            }}
          >
            <Streak
              streak={2}
              connectionMode="public"
              gameMode="normal"
              inGame={true}
            />
          </div>

          <Divider
            label={<div style={{ fontSize: "1.25rem" }}>Guesses</div>}
            orientation="vertical"
          />
          <div className="stats__guesses">
            <StatsDistribution stats={[1, 6, 3, 10, 15, 2]} />

            <div className="stats__misc">
              <div>
                Average Guesses:{" "}
                {(userStats.totalGuesses / userStats.totalGames).toFixed(2)}
              </div>
              <div># Out of Guesses: {userStats.totalOOG}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StatsPage
