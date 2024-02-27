import { useState, useEffect } from "react"
import axios from "axios"

import { isEmpty, sum } from "lodash-es"
const _ = { isEmpty, sum }

import { Divider, SegmentedControl } from "@mantine/core"
import classes from "./StatsPage.module.css"

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
        <div className="stats__container">
          <div className="stats__tabs">
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
          </div>
          <div className="stats__header">
            <div className="stats__header--username">Goldjet</div>
            <div className="stats__header--title">- the RECKLESS -</div>
          </div>
          <div className="stats__stopwatch">
            {"{"}
            {/* <Stopwatch
              time={
                userStats.totalSolveTime / _.sum(userStats.solveDistribution)
              }
            /> */}
            <Stopwatch time={45} />
            {"}"}
          </div>

          <div className="stats__stopwatch--caption">Avg Solve Time</div>

          <Divider
            className="stats__divider"
            label={<div style={{ fontSize: "1rem" }}>Games</div>}
            orientation="vertical"
            color="gray.6"
          />
          <div className="stats__games">
            <div className="stats__games--icon">
              <img src={GameIcon} alt="GameIcon" />
            </div>
            &nbsp;
            <div className="stats__games--total">{userStats.totalGames}</div>
          </div>

          <div className="stats__wins">
            <span className="stats__wins--total">{userStats.totalWins}</span>
            &nbsp;Wins
          </div>

          <div className="stats__streak">
            <Streak
              streak={userStats.currStreak}
              connectionMode="public"
              gameMode={gameModePath}
              inGame={true}
            />
            |
            <span style={{ fontWeight: "700", paddingRight: "0.7rem" }}>
              {userStats.maxStreak}
            </span>
            {/* <Streak
              streak={null}
              connectionMode="public"
              gameMode="normal"
              inGame={true}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "0.8rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              CURR
              <span
                style={{ fontSize: "3rem", fontWeight: "500", lineHeight: "1" }}
              >
                {userStats.currStreak}
              </span>
            </div>
            <span
              style={{
                fontSize: "4rem",
              }}
            >
              &nbsp;|
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "0.8rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              MAX
              <span
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  lineHeight: "1",
                }}
              >
                {userStats.maxStreak}
              </span>
            </div> */}
          </div>

          <Divider
            label={<div style={{ fontSize: "1rem" }}>Guesses</div>}
            orientation="vertical"
          />

          <div className="stats__guesses">
            <div className="stats__guesses--distribution">
              <StatsDistribution stats={userStats.solveDistribution} />
            </div>
            <div className="stats__guesses--misc">
              <div className="stats__guesses--misc--title">
                Average
                <br />
                Guesses
              </div>
              <div className="stats__guesses--misc--total">
                {(userStats.totalGuesses / userStats.totalGames).toFixed(2)}
              </div>
              <div className="stats__guesses--misc--title">
                Out of
                <br />
                Guesses
                <div className="stats__guesses--misc--total">
                  {userStats.totalOOG}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StatsPage
