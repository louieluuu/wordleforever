import React from "react"
import socket from "../socket"

function KickConfirmationModal({
  userId,
  roomId,
  displayName,
  setShowKickConfirmationModal,
}) {
  function kickUser() {
    // TODO: display something to the user
    socket.emit("kickUser", userId, roomId)
    setShowKickConfirmationModal(false)
  }
  return (
    <div className="kick-confirmation-modal">
      Remove{" "}
      <span className="kick-confirmation-modal__display-name">
        {displayName}
      </span>{" "}
      from the room?
      <div className="kick-confirmation-modal__buttons">
        <div
          className="kick-confirmation-modal__buttons--left"
          onClick={kickUser}
        >
          ✔
        </div>
        <div
          className="kick-confirmation-modal__buttons--right"
          onClick={() => setShowKickConfirmationModal(false)}
        >
          ✘
        </div>
      </div>
    </div>
  )
}

export default KickConfirmationModal
