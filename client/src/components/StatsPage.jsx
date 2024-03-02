import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

import { isEmpty, sum } from "lodash-es"
const _ = { isEmpty, sum }

// MantineUI Component
import { SegmentedControl } from "@mantine/core"
import "@mantine/core/styles/SegmentedControl.css"
import "../styles/components/_segmented-control.scss"

// SVGs
import GameIcon from "../assets/game-icon.svg"
import Crown from "../assets/crown.svg?react"

// SVG Components
import Streak from "./Streak"
import Stopwatch from "./Stopwatch"

// Components
import Divider from "./Divider"
import StatsDistribution from "./StatsDistribution"

function StatsPage() {
  // Specifying the MantineUI-specific class names.
  const segmentedControlClasses = {
    root: "root",
    indicator: "indicator",
    control: "control",
    label: "label",
  }

  const { username } = useParams()

  const [userStats, setUserStats] = useState({})
  const [connectionModePath, setConnectionModePath] = useState(
    localStorage.getItem("connectionModePath") || "public"
  )
  const [gameModePath, setGameModePath] = useState(
    localStorage.getItem("gameModePath") || "normal"
  )

  useEffect(() => {
    const SERVER_URL =
      process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_EC2_URL
        : `${import.meta.env.VITE_IP_ADDR}:3005`

    const userPath = `user/${username}`
    console.log(`userPath: ${userPath}`)

    // Would like to use await syntax, but useEffect can't be async.
    axios.get(`${SERVER_URL}/${userPath}`).then((res) => {
      console.log(res.data.stats)
      // TODO: Careful here: if res.data is undefined, you'll be rendering a bunch of undefined as we're calling the properties directly. Need better error checking.
      setUserStats(res.data.stats)
    })
  }, [])

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
              classNames={segmentedControlClasses}
              value={connectionModePath}
              data={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
              ]}
              onChange={changeConnectionModePath}
            />
            <SegmentedControl
              classNames={segmentedControlClasses}
              value={gameModePath}
              data={[
                { value: "normal", label: "Normal" },
                { value: "challenge", label: "Challenge" },
              ]}
              onChange={changeGameModePath}
            />
          </div>
          <div className="stats__header">
            <div className="stats__header--username">{username}</div>
            <div className="stats__header--title">- the RECKLESS -</div>
          </div>
          <div className="stats__stopwatch">
            <div className="stats__stopwatch--icon">
              {"{"}
              <Stopwatch
                time={
                  userStats[connectionModePath][gameModePath].totalSolveTime /
                  _.sum(
                    userStats[connectionModePath][gameModePath]
                      .solveDistribution
                  )
                }
              />
              {"}"}
            </div>
            <div className="stats__stopwatch--caption">Avg Solve Time</div>
          </div>

          <Divider label="Games" />

          <div className="stats__total-games">
            <div className="stats__total-games--icon">
              <img src={GameIcon} alt="GameIcon" />
            </div>
            &nbsp;
            <div className="stats__total-games--total">
              {userStats[connectionModePath][gameModePath].totalGames}
            </div>
          </div>

          <div className="stats__game-stats">
            <div className="stats__game-info">
              {/* Wins */}
              <div className="stats__game-info--wins">
                <div className="stats__game-info--wins--text">Wins</div>
                <div className="stats__game-info--wins--total">
                  {userStats[connectionModePath][gameModePath].totalWins}&nbsp;
                  <span className="stats__game-info--wins--total--percent">
                    {"("}
                    {(
                      (userStats[connectionModePath][gameModePath].totalWins /
                        userStats[connectionModePath][gameModePath]
                          .totalGames) *
                      100
                    ).toFixed(0)}
                    %{")"}
                  </span>
                </div>
              </div>

              {/* Solves */}
              <div className="stats__game-info--solves">
                <div className="stats__game-info--solves--text">Solves</div>
                <div className="stats__game-info--solves--total">
                  {_.sum(
                    userStats[connectionModePath][gameModePath]
                      .solveDistribution
                  )}
                  &nbsp;
                  <span className="stats__game-info--solves--total--percent">
                    {"("}
                    {(
                      (_.sum(
                        userStats[connectionModePath][gameModePath]
                          .solveDistribution
                      ) /
                        userStats[connectionModePath][gameModePath]
                          .totalGames) *
                      100
                    ).toFixed(0)}
                    %{")"}
                  </span>
                </div>
              </div>
            </div>

            {connectionModePath === "public" ? (
              <div className={`stats__game-mode`}>
                <Streak
                  streak={
                    userStats[connectionModePath][gameModePath].currStreak
                  }
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
                      {userStats[connectionModePath][gameModePath].currStreak}
                    </div>
                  </div>

                  {/* Best streak */}
                  <div className="stats__game-mode--bot">
                    <div className="stats__game-mode--bot--text">Best</div>
                    <div className="stats__game-mode--bot--total">
                      {userStats[connectionModePath][gameModePath].maxStreak}
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

          <Divider label="Guesses" />

          <div className="stats__guesses">
            <StatsDistribution
              stats={
                userStats[connectionModePath][gameModePath].solveDistribution
              }
            />
            <div className="stats__guesses--misc">
              <div className="stats__guesses--misc--average">
                <div className="stats__guesses--misc--title">
                  Avg
                  <br />
                  Guesses
                </div>
                <div className="stats__guesses--misc--total">
                  {(
                    userStats[connectionModePath][gameModePath].totalGuesses /
                    userStats[connectionModePath][gameModePath].totalGames
                  ).toFixed(2)}
                </div>
              </div>
              <div className="stats__guesses--misc--oog">
                <div className="stats__guesses--misc--title">
                  Out of
                  <br />
                  Guesses
                </div>
                <div className="stats__guesses--misc--total">
                  {userStats[connectionModePath][gameModePath].totalOOG}
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
