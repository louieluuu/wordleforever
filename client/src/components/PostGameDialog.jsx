import React, { useRef } from "react"

import { sum, min, max } from "lodash-es"
const _ = { sum, min, max }

import socket from "../socket"

import { Dialog } from "@headlessui/react"

import { TfiClose } from "react-icons/tfi"
import { MdOutlineDoubleArrow } from "react-icons/md"

// TODO: please fix this complete abomination from top to bottom. god has abandoned us.

function PostGameDialog({
  setShowPostGameDialog,
  showScoreboard,
  setShowScoreboard,
  userInfoSortedByPoints,
  maxRounds,
}) {
  // X Button ref
  const closeButtonRef = useRef(null)

  // Inline styles
  const flexStart = {
    display: "flex",
    justifyContent: "flex-start",
  }

  const flexCenter = {
    display: "flex",
    justifyContent: "center",
  }

  const flexColumn = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }

  // Destructured best stats (used to highlight stats in the table)
  const { maxPoints, maxRoundsWon, maxSolves, minAvgSolveTime } = getBestStats()

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
  }

  function switchPage() {
    setShowScoreboard((prevState) => !prevState)
  }

  function getBestStats() {
    // By starting at 1, we guarantee that if no one solves anything in a match, no one's stats are highlighted. (If we started at 0, then a bunch of 0's would be highlighted.)
    let maxPoints = 1
    let maxRoundsWon = 1
    let maxSolves = 1
    let minAvgSolveTime = Infinity

    for (let i = 0; i < userInfoSortedByPoints.length; i++) {
      const user = userInfoSortedByPoints[i]

      maxPoints = Math.max(maxPoints, user.points)
      maxRoundsWon = Math.max(maxRoundsWon, user.roundsWon)
      maxSolves = Math.max(maxSolves, _.sum(user.solveDistribution))
      if (_.sum(user.solveDistribution) > 0) {
        minAvgSolveTime = Math.min(
          minAvgSolveTime,
          calculateAvgSolveTime(user.solveDistribution, user.totalSolveTime)
        )
      }
    }

    minAvgSolveTime = minAvgSolveTime.toFixed(2)

    // Return an object with the best values for each stat.
    return { maxPoints, maxRoundsWon, maxSolves, minAvgSolveTime }
  }

  function calculateAvgSolveTime(solveDistribution, totalSolveTime) {
    return _.sum(solveDistribution) > 0
      ? (totalSolveTime / _.sum(solveDistribution)).toFixed(2)
      : "/"
  }

  function isMatchingUserId(index) {
    return userInfoSortedByPoints[index].userId === socket.userId
  }

  function isBestStat(stat, userStat) {
    if (stat === "points") {
      return userStat === maxPoints
    } else if (stat === "roundsWon") {
      return userStat === maxRoundsWon
    } else if (stat === "solves") {
      return userStat === maxSolves
    } else if (stat === "avgSolveTime") {
      if (userStat === "/") {
        return false
      }
      return userStat === minAvgSolveTime
    }
  }

  function getStatClassName(stat, userStat, userIndex) {
    let className = `postgame__stat`
    if (isBestStat(stat, userStat) && isMatchingUserId(userIndex)) {
      className += "--highlight"
    }
    return className
  }

  return (
    <Dialog
      className="dialog--stats"
      open={true}
      onClose={handleSetShowPostGameDialog}
      initialFocus={closeButtonRef}
    >
      <Dialog.Panel>
        <div className="dialog__right">
          <div ref={closeButtonRef}>
            <TfiClose
              className="dialog__btn--close"
              onClick={handleSetShowPostGameDialog}
            />
          </div>
        </div>

        {showScoreboard ? (
          <div className="postgame__scoreboard">
            <Dialog.Title
              style={{
                fontFamily: "Calistoga",
                marginTop: "0.5rem",
                marginBottom: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Results
            </Dialog.Title>

            <hr style={{ marginBlock: "1.3rem" }} />

            {/* 1st place */}
            <div style={{ ...flexCenter, fontSize: "3rem" }}>👑</div>
            <div
              style={{
                ...flexCenter,
                fontSize: "2rem",
              }}
            >
              <b>1.&nbsp;</b>
              <span
                className={`postgame__user${
                  isMatchingUserId(0) ? "--highlight" : ""
                }`}
              >
                {userInfoSortedByPoints[0].displayName}
              </span>
            </div>
            <div style={{ ...flexCenter, fontSize: "1.5rem", opacity: "70%" }}>
              {userInfoSortedByPoints[0].points} pts
            </div>

            <br></br>

            {/* 2nd and 3rd place */}
            <div
              style={{
                display: "flex",
                fontSize: "1.3rem",
                justifyContent: "space-around",
              }}
            >
              {/* 2nd place */}
              <div
                style={{
                  ...flexStart,
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <b>2.&nbsp;</b>
                <span
                  className={`postgame__user${
                    isMatchingUserId(1) ? "--highlight" : ""
                  }`}
                >
                  {" "}
                  {userInfoSortedByPoints[1].displayName}
                </span>

                <div style={{ opacity: "50%" }}>
                  {userInfoSortedByPoints[1].points} pts
                </div>
              </div>

              {userInfoSortedByPoints.length > 2 && (
                <>
                  {/* 3rd place */}
                  <div
                    style={{
                      ...flexStart,
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <b>3.&nbsp;</b>
                    <span
                      className={`postgame__user${
                        isMatchingUserId(2) ? "--highlight" : ""
                      }`}
                    >
                      {userInfoSortedByPoints[2].displayName}
                    </span>
                    <div style={{ opacity: "50%" }}>
                      {userInfoSortedByPoints[2].points} pts
                    </div>
                  </div>
                </>
              )}
            </div>

            <br></br>

            {/* 4th place and below */}
            {userInfoSortedByPoints.length > 3 && (
              <div style={flexColumn}>
                <br></br>
                {userInfoSortedByPoints.slice(3).map((user, userIndex) => (
                  <div key={user.userId}>
                    {`${userIndex + 4}.`}&nbsp;
                    <span
                      className={`postgame__user${
                        isMatchingUserId(userIndex + 3) ? "--highlight" : ""
                      }`}
                    >
                      {user.displayName}
                    </span>
                    &nbsp;-&nbsp;
                    {user.points}
                  </div>
                ))}
                <br></br>
              </div>
            )}
            <hr style={{ marginBlock: "1.3rem" }} />
          </div>
        ) : (
          <>
            <Dialog.Title
              style={{
                fontFamily: "Calistoga",
                marginTop: "0.5rem",
                marginBottom: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Statistics
            </Dialog.Title>
            <hr style={{ marginBlock: "1.3rem" }} />
            <p
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            ></p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              className="scoreboard-users"
            >
              <div className="table-container">
                <table border="1" frame="void" rules="all">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Points</th>
                      <th>Won</th>
                      <th>Solved</th>
                      <th>Avg Solve Time</th>
                      <th>Avg Guesses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInfoSortedByPoints.map((user, userIndex) => (
                      <tr key={user.userId}>
                        <td>
                          <span
                            className={`postgame__user${
                              isMatchingUserId(userIndex) ? "--highlight" : ""
                            }`}
                          >
                            {user.displayName}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getStatClassName(
                              "points",
                              user.points,
                              userIndex
                            )}
                          >
                            {user.points}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getStatClassName(
                              "roundsWon",
                              user.roundsWon,
                              userIndex
                            )}
                          >
                            {user.roundsWon}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getStatClassName(
                              "solves",
                              _.sum(user.solveDistribution),
                              userIndex
                            )}
                          >
                            {_.sum(user.solveDistribution)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getStatClassName(
                              "avgSolveTime",
                              calculateAvgSolveTime(
                                user.solveDistribution,
                                user.totalSolveTime
                              ),
                              userIndex
                            )}
                          >
                            {calculateAvgSolveTime(
                              user.solveDistribution,
                              user.totalSolveTime
                            )}
                          </span>
                        </td>
                        {/* totalGuesses' "best" is ambiguous. */}
                        <td>
                          {user.totalGuesses > 0
                            ? (user.totalGuesses / maxRounds).toFixed(2)
                            : "/"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <hr style={{ marginBlock: "1.3rem" }} />
          </>
        )}

        <div style={{ ...flexCenter, fontSize: "2rem" }}>
          {showScoreboard ? (
            <MdOutlineDoubleArrow onClick={switchPage} />
          ) : (
            <MdOutlineDoubleArrow
              style={{ transform: "scaleX(-1)" }}
              onClick={switchPage}
            />
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}

export default PostGameDialog
