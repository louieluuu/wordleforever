import React, { useRef } from "react"

import { Dialog } from "@headlessui/react"

import { TfiClose } from "react-icons/tfi"
import { MdOutlineDoubleArrow } from "react-icons/md"

// TODO: please fix this complete abomination from top to bottom. god has abandoned us.

// TODO 2: user.roundsSolved === user.solveDistribution.reduce((a, b) => a + b, 0) - not sure where to put this though

function PostGameDialog({
  setShowPostGameDialog,
  showScoreboard,
  setShowScoreboard,
  userInfoSortedByPoints,
  maxRounds,
}) {
  const flexStart = {
    display: "flex",
    justifyContent: "flex-start",
  }

  const flexCenter = {
    display: "flex",
    justifyContent: "center",
  }

  const flexEnd = {
    display: "flex",
    justifyContent: "flex-end",
  }

  const flexColumn = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }

  // TODO: hanging variables?
  const closeButtonRef = useRef(null)

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
  }

  function switchPage() {
    setShowScoreboard((prevState) => !prevState)
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
              Results
            </Dialog.Title>

            <hr style={{ marginBlock: "1.3rem" }} />

            {/* 1st place */}
            <div style={{ ...flexCenter, fontSize: "3rem" }}>👑</div>
            <div style={{ ...flexCenter, fontSize: "2rem" }}>
              <b>1.&nbsp;</b> {userInfoSortedByPoints[0].displayName}
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
                <b>2.&nbsp;</b> {userInfoSortedByPoints[1].displayName}
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
                    {userInfoSortedByPoints[2].displayName}
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
                  <div key={userIndex}>
                    {`${userIndex + 4}.`} {user.displayName}&nbsp;-&nbsp;
                    {user.points}
                  </div>
                ))}
                <br></br>
              </div>
            )}
            <hr style={{ marginBlock: "1.3rem" }} />
          </>
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
                      <th>Avg Guesses</th>
                      <th>Avg Solve Time</th>
                      {/* Add more headers for additional properties */}
                    </tr>
                  </thead>
                  <tbody>
                    {userInfoSortedByPoints.map((user, userIndex) => (
                      <tr key={userIndex}>
                        <td>{user.displayName}</td>
                        <td>{user.points}</td>
                        <td>{user.roundsWon}</td>
                        <td>
                          {user.solveDistribution.reduce((a, b) => a + b, 0)}
                        </td>
                        <td>
                          {user.totalGuesses > 0
                            ? (user.totalGuesses / maxRounds).toFixed(2)
                            : "/"}
                        </td>
                        <td>
                          {user.solveDistribution.reduce((a, b) => a + b, 0) > 0
                            ? (
                                user.totalSolveTime /
                                user.solveDistribution.reduce(
                                  (a, b) => a + b,
                                  0
                                )
                              ).toFixed(2)
                            : "/"}
                        </td>
                        {/* Add more cells for additional properties */}
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
