import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

import { isEmpty, sum } from "lodash-es"
const _ = { isEmpty, sum }

// MantineUI Component
import { SegmentedControl } from "@mantine/core"
import "@mantine/core/styles/SegmentedControl.css"

// React-spinners Component
import { Blocks } from "react-loader-spinner"

// SVGs
import GameIcon from "../assets/game-icon.svg"

// SVG Components
import Crown from "./Crown"
import GuessIcon from "./GuessIcon"
import Streak from "./Streak"
import Stopwatch from "./Stopwatch"

// Components
import Divider from "./Divider"
import StatsDistribution from "./StatsDistribution"

function StatsPage({ isPhoneLayout }) {
  // TODO: Actually, I need the case-insensitive username from the db.
  // /user/goldjet should return Goldjet as the username.
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

    // Would like to use await syntax, but useEffect can't be async.
    axios.get(`${SERVER_URL}/${userPath}`).then((res) => {
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

  // TODO: The "LOADING..." could definitely be improved. Maybe a spinner or something.
  return (
    <>
      {_.isEmpty(userStats) ? (
        <div>LOADING...</div>
      ) : (
        <div className="stats__page">
          <Blocks
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
            visible={true}
          />
          <div className="stats__tabs">
            <SegmentedControl
              value={connectionModePath}
              data={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
              ]}
              onChange={changeConnectionModePath}
            />
            <SegmentedControl
              value={gameModePath}
              data={[
                { value: "normal", label: "Normal" },
                { value: "challenge", label: "Challenge" },
              ]}
              onChange={changeGameModePath}
            />
          </div>

          <div className="stats__container">
            <div className="stats__header">
              <div className="stats__header--username">{username}</div>
              <div className="stats__header--title">- the RECKLESS -</div>
            </div>
            <div className="stats__stopwatch">
              <div className="stats__stopwatch--icon">
                {"{"}
                <Stopwatch
                  time={
                    userStats[connectionModePath][gameModePath].totalSolveTime >
                    0
                      ? userStats[connectionModePath][gameModePath]
                          .totalSolveTime /
                        _.sum(
                          userStats[connectionModePath][gameModePath]
                            .solveDistribution
                        )
                      : null
                  }
                />
                {"}"}
              </div>
              <div className="stats__stopwatch--caption">Avg Solve Time</div>
            </div>

            <div className="stats__secondary__container">
              <div className="stats__secondary__container--subcontainer">
                <Divider label="Games" />
                <div className="stats__total-games">
                  <div className="stats__total-games--icon">
                    <img src={GameIcon} alt="Game Icon" />
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
                        {userStats[connectionModePath][gameModePath].totalWins}
                        &nbsp;
                        <span className="stats__game-info--wins--total--percent">
                          {"("}
                          {userStats[connectionModePath][gameModePath]
                            .totalGames > 0
                            ? (
                                (userStats[connectionModePath][gameModePath]
                                  .totalWins /
                                  userStats[connectionModePath][gameModePath]
                                    .totalGames) *
                                100
                              ).toFixed(0)
                            : "--"}
                          %{")"}
                        </span>
                      </div>
                    </div>

                    {/* Solves */}
                    <div className="stats__game-info--solves">
                      <div className="stats__game-info--solves--text">
                        Solves
                      </div>
                      <div className="stats__game-info--solves--total">
                        {_.sum(
                          userStats[connectionModePath][gameModePath]
                            .solveDistribution
                        )}
                        &nbsp;
                        <span className="stats__game-info--solves--total--percent">
                          {"("}
                          {userStats[connectionModePath][gameModePath]
                            .totalGames > 0
                            ? (
                                (_.sum(
                                  userStats[connectionModePath][gameModePath]
                                    .solveDistribution
                                ) /
                                  userStats[connectionModePath][gameModePath]
                                    .totalGames) *
                                100
                              ).toFixed(0)
                            : "--"}
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
                        bestStreak={
                          userStats[connectionModePath][gameModePath].bestStreak
                        }
                        connectionMode="public"
                        gameMode={gameModePath}
                        inGame={true}
                        renderNumber={false}
                      />
                      {/* Curr streak */}
                      <div className="stats__game-mode--numbers">
                        <div className="stats__game-mode--top">
                          <div className="stats__game-mode--top--text">
                            Curr
                          </div>
                          <div className={`stats__game-mode--top--total`}>
                            {
                              userStats[connectionModePath][gameModePath]
                                .currStreak
                            }
                          </div>
                        </div>

                        {/* Best streak */}
                        <div className="stats__game-mode--bot">
                          <div className="stats__game-mode--bot--text">
                            Best
                          </div>
                          <div className="stats__game-mode--bot--total">
                            {
                              userStats[connectionModePath][gameModePath]
                                .bestStreak
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="stats__game-mode">
                      <Crown
                        matches={
                          userStats[connectionModePath][gameModePath]
                            .totalMatches
                        }
                      />
                      {/* Victories */}
                      <div className="stats__game-mode--numbers">
                        <div className="stats__game-mode--top">
                          <div className="stats__game-mode--top--text">
                            Crowns
                          </div>
                          <div className={`stats__game-mode--top--total`}>
                            {
                              userStats[connectionModePath][gameModePath]
                                .totalCrowns
                            }
                          </div>
                        </div>

                        {/* Matches */}
                        <div className="stats__game-mode--bot">
                          <div className="stats__game-mode--bot--text">
                            Matches
                          </div>
                          <div className="stats__game-mode--bot--total">
                            {
                              userStats[connectionModePath][gameModePath]
                                .totalMatches
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="stats__secondary__container--subcontainer">
                <Divider label="Guesses" />
                <div className="stats__total-guesses">
                  <div className="stats__total-guesses--icon">
                    <GuessIcon />
                  </div>
                  &nbsp;
                  <div className="stats__total-guesses--total">
                    {userStats[connectionModePath][gameModePath].totalGuesses}
                  </div>
                </div>

                <div className="stats__guesses">
                  <StatsDistribution
                    stats={
                      userStats[connectionModePath][gameModePath]
                        .solveDistribution
                    }
                    isPhoneLayout={isPhoneLayout}
                  />
                  <div className="stats__guesses--misc">
                    <div className="stats__guesses--misc--average">
                      <div className="stats__guesses--misc--title">
                        Avg
                        <br />
                        Guesses
                      </div>
                      <div className="stats__guesses--misc--total">
                        {userStats[connectionModePath][gameModePath]
                          .totalGames > 0
                          ? (
                              userStats[connectionModePath][gameModePath]
                                .totalGuesses /
                              userStats[connectionModePath][gameModePath]
                                .totalGames
                            ).toFixed(2)
                          : "-"}
                      </div>
                    </div>
                    <div className="stats__guesses--misc--oog">
                      <div className="stats__guesses--misc--title">OOG</div>
                      <div className="stats__guesses--misc--total">
                        {userStats[connectionModePath][gameModePath].totalOOG}
                      </div>
                    </div>
                  </div>
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
