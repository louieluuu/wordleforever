import React, { useRef } from "react"

import { Dialog } from "@headlessui/react"

import { GrClose } from "react-icons/gr"

function PostGameDialog({ setShowPostGameDialog, userInfo }) {
  const closeButtonRef = useRef(null)
  const orderedUsers = orderUserInfo()

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
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
      </Dialog.Panel>
    </Dialog>
  )
}

export default PostGameDialog
