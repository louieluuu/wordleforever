import { useState, useEffect } from "react"
import axios from "axios"

import { isEmpty, sum } from "lodash-es"
const _ = { isEmpty, sum }

import { Divider, SegmentedControl } from "@mantine/core"
import classes from "./StatsPage.module.css"

import StatsDistribution from "./StatsDistribution"

import GameIcon from "../assets/game-icon.svg"

import Crown from "../assets/crown.svg?react"
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

  function allStatsLoaded() {
    let requiredStats = []

    if (connectionModePath === "public") {
      requiredStats = [
        "currStreak",
        "maxStreak",
        "totalGames",
        "totalWins",
        "solveDistribution",
        "totalSolveTime",
        "totalGuesses",
        "totalOOG",
      ]
    } else if (connectionModePath === "private") {
      requiredStats = [
        "totalGames",
        "totalWins",
        "solveDistribution",
        "totalSolveTime",
        "totalGuesses",
        "totalOOG",
      ]
    }

    return requiredStats.every((stat) => stat in userStats)
  }

  return (
    <>
      {!allStatsLoaded(userStats) ? (
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
            <div className="stats__stopwatch--icon">
              {"{"}
              {/* <Stopwatch
              time={
                userStats.totalSolveTime / _.sum(userStats.solveDistribution)
              }
            /> */}
              <Stopwatch time={15} />
              {"}"}
            </div>
            <div className="stats__stopwatch--caption">Avg Solve Time</div>
          </div>

          <Divider
            label={<div className="stats__divider--label">Games</div>}
            orientation="vertical"
            color="lightgray"
          />

          <div className="stats__total-games">
            <div className="stats__total-games--icon">
              <img src={GameIcon} alt="GameIcon" />
            </div>
            &nbsp;
            <div className="stats__total-games--total">
              {userStats.totalGames}
            </div>
          </div>

          <div className="stats__game-stats">
            <div className="stats__game-info">
              {/* Wins */}
              <div className="stats__game-info--wins">
                <div className="stats__game-info--wins--text">Wins</div>
                <div className="stats__game-info--wins--total">
                  {userStats.totalWins}
                </div>
              </div>

              {/* Solves */}
              <div className="stats__game-info--solves">
                <div className="stats__game-info--solves--text">Solves</div>
                <div className="stats__game-info--solves--total">
                  {_.sum(userStats.solveDistribution)}
                </div>
              </div>
            </div>

            {connectionModePath === "public" ? (
              <div className={`stats__game-mode`}>
                <Streak
                  streak={userStats.currStreak}
                  connectionMode="public"
                  gameMode={gameModePath}
                  inGame={true}
                  renderNumber={false}
                />
                {/* Curr streak */}
                <div className="stats__game-mode--numbers">
                  <div className="stats__game-mode--top">
                    <div className="stats__game-mode--top--text">Curr</div>
                    <div className={`stats__game-mode--top--total`}>
                      {userStats.currStreak}
                    </div>
                  </div>

                  {/* Best streak */}
                  <div className="stats__game-mode--bot">
                    <div className="stats__game-mode--bot--text">Best</div>
                    <div className="stats__game-mode--bot--total">
                      {userStats.maxStreak}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="stats__game-mode">
                <Crown />
                {/* Victories */}
                <div className="stats__game-mode--numbers">
                  <div className="stats__game-mode--top">
                    <div className="stats__game-mode--top--text">Crowns</div>
                    <div className={`stats__game-mode--top--total`}>5</div>
                  </div>

                  {/* Matches */}
                  <div className="stats__game-mode--bot">
                    <div className="stats__game-mode--bot--text">Matches</div>
                    <div className="stats__game-mode--bot--total">10</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Divider
            label={<div className="stats__divider--label">Guesses</div>}
            orientation="vertical"
            color="lightgray"
          />

          <div className="stats__guesses">
            <StatsDistribution stats={userStats.solveDistribution} />
            <div className="stats__guesses--misc">
              <div className="stats__guesses--misc--average">
                <div className="stats__guesses--misc--title">
                  Avg
                  <br />
                  Guesses
                </div>
                <div className="stats__guesses--misc--total">
                  {(userStats.totalGuesses / userStats.totalGames).toFixed(2)}
                </div>
              </div>
              <div className="stats__guesses--misc--oog">
                <div className="stats__guesses--misc--title">
                  Out of
                  <br />
                  Guesses
                </div>
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
