import React, { useRef } from "react"

import { Dialog } from "@headlessui/react"

import { GrClose } from "react-icons/gr"

function PostGameDialog({
  setShowPostGameDialog,
  showScoreboard,
  setShowScoreboard,
  userInfo,
  maxRounds,
}) {
  const closeButtonRef = useRef(null)
  const orderedUsers = orderUserInfo()

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
  }

  function switchPage() {
    setShowScoreboard((prevState) => !prevState)
  }

  function orderUserInfo() {
    const sortedUsers = userInfo.sort((a, b) => b.points - a.points)
    return sortedUsers || []
  }

  return (
    <Dialog
      className="dialog"
      open={true}
      onClose={handleSetShowPostGameDialog}
      initialFocus={closeButtonRef}
    >
      <Dialog.Panel>
        <div className="dialog__right">
          <div ref={closeButtonRef}>
            <GrClose
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
              Scoreboard
            </Dialog.Title>

            <hr style={{ marginBlock: "1.3rem" }} />

            <p
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Players
            </p>

            <div
              style={{
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              className="scoreboard-users"
            >
              {orderedUsers.map((user, userIndex) => (
                <div key={userIndex} className="scoreboard-user">
                  {user.username}&nbsp;-&nbsp;
                  {user.points}
                </div>
              ))}
            </div>

            <hr style={{ marginBlock: "1.3rem" }} />
          </>
        ) : (
          <>
            {" "}
            <Dialog.Title
              style={{
                fontFamily: "Calistoga",
                marginTop: "0.5rem",
                marginBottom: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Stats
            </Dialog.Title>
            <hr style={{ marginBlock: "1.3rem" }} />
            <p
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Players
            </p>
            <div
              style={{
                fontWeight: "bold",
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
                      <th>Users</th>
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

        <button className="dialog-switch-page" onClick={switchPage} />
      </Dialog.Panel>
    </Dialog>
  )
}

export default PostGameDialog
