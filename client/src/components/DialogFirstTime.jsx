import { useRef } from "react"
import { Dialog } from "@headlessui/react"

import { IoCloseSharp } from "react-icons/io5"

export default function DialogFirstTime({ isFirstTime, setIsFirstTime }) {
  // TODO: useRef not working for some reason
  const exitButton = useRef(null)

  function handleClick() {
    setIsFirstTime(false)
    localStorage.setItem("isFirstTime", false)
  }

  return (
    <Dialog
      className="dialog__first-time"
      open={isFirstTime}
      onClose={handleClick}
      initialFocus={exitButton}>
      <Dialog.Panel>
        <div className="dialog__right" ref={exitButton}>
          <IoCloseSharp className="dialog__btn--close" onClick={handleClick} />
        </div>

        <Dialog.Title style={{ fontFamily: "Calistoga", marginTop: "0.5rem" }}>
          Welcome, Wordler!
        </Dialog.Title>
        <Dialog.Description>
          <b>
            <i>Wordle Forever</i>
          </b>
          &nbsp;is a multiplayer recreation of&nbsp;
          <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank">
            Wordle.&nbsp;
          </a>
        </Dialog.Description>

        <p>Queue up to see how far your winning streak 🔥 can go.</p>

        <p>
          Or, create a Private room and invite up to 3 of your friends to see which one of you is
          the true wordsmith!
        </p>

        <p>Have fun, and don't forget to try Challenge Mode!</p>
      </Dialog.Panel>
    </Dialog>
  )
}
