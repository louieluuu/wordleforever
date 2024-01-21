import React, { useRef } from "react"

import { Dialog } from "@headlessui/react"

import { TfiClose } from "react-icons/tfi"
import { MdOutlineDoubleArrow } from "react-icons/md"

// TODO: please fix this complete abomination from top to bottom. god has abandoned us.

function PostGameDialog({
  setShowPostGameDialog,
  showScoreboard,
  setShowScoreboard,
  userInfo,
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
  const orderedUsers = orderUserInfo()

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
  }

  function switchPage() {
    setShowScoreboard((prevState) => !prevState)
  }

  function orderUserInfo() {
    const copyUserInfo = [...userInfo]
    const sortedUsers = copyUserInfo.sort((a, b) => b.points - a.points)
    return sortedUsers || []
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
              <b>1.&nbsp;</b> {orderedUsers[0].username}
            </div>
            <div style={{ ...flexCenter, fontSize: "1.5rem", opacity: "70%" }}>
              {orderedUsers[0].points} pts
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
                <b>2.&nbsp;</b> {orderedUsers[1].username}
                <div style={{ opacity: "50%" }}>
                  {orderedUsers[1].points} pts
                </div>
              </div>

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
                {orderedUsers[2].username}
                <div style={{ opacity: "50%" }}>
                  {orderedUsers[2].points} pts
                </div>
              </div>
            </div>

            <br></br>

            {orderedUsers.length > 3 && (
              <div style={flexColumn}>
                <br></br>
                {orderedUsers.slice(3).map((user, userIndex) => (
                  <div key={userIndex}>
                    {`${userIndex + 4}.`} {user.username}&nbsp;-&nbsp;
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
                <table>
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
                    {orderedUsers.map((user, userIndex) => (
                      <tr key={userIndex}>
                        <td>{user.username}</td>
                        <td>{user.points}</td>
                        <td>{user.roundsWon}</td>
                        <td>{user.roundsSolved}</td>
                        <td>
                          {user.totalGuesses > 0
                            ? (user.totalGuesses / maxRounds).toFixed(2)
                            : "/"}
                        </td>
                        <td>
                          {user.totalTimeInRoundsSolved > 0
                            ? (
                                user.totalTimeInRoundsSolved / maxRounds
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
