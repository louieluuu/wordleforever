import React, { useRef } from "react"
import socket from "../socket"
// import { Dialog } from "@headlessui/react"

function KickConfirmationModal({
  userId,
  roomId,
  displayName,
  setShowKickConfirmationModal,
}) {
  const closeButtonRef = useRef(null)

  function kickUser() {
    // TODO: display something to the user
    socket.emit("kickUser", userId, roomId)
    setShowKickConfirmationModal(false)
  }
  return (
    // Ideally use a dialog instead but I suck at styling these
    // <Dialog
    //   className="kick-confirmation-dialog"
    //   open={true}
    //   onClose={() => setShowKickConfirmationModal(false)}
    //   initialFocus={closeButtonRef}
    // >
    //   <Dialog.Panel>
    //     <p>
    //       Kick{" "}
    //       <span className="kick-confirmation-dialog__display-name">
    //         {displayName}
    //       </span>{" "}
    //       from the room?
    //     </p>
    //     <div className="kick-confirmation-dialog__buttons">
    //       <button onClick={kickUser}>Yes</button>
    //       <button onClick={() => setShowKickConfirmationModal(false)}>
    //         No
    //       </button>
    //     </div>
    //   </Dialog.Panel>
    // </Dialog>

    <div className="kick-confirmation-modal">
      <p>
        Kick{" "}
        <span className="kick-confirmation-modal__display-name">
          {displayName}
        </span>{" "}
        from the room?
      </p>
      <div className="kick-confirmation-modal__buttons">
        <button onClick={kickUser}>Yes</button>
        <button onClick={() => setShowKickConfirmationModal(false)}>No</button>
      </div>
    </div>
  )
}

export default KickConfirmationModal
