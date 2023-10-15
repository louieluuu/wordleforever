import React, { useEffect, useState } from "react"

import { RiQuestionLine } from "react-icons/ri"
import { BiBarChartAlt2 } from "react-icons/bi"
import { FaCog } from "react-icons/fa"
import { RiMoonClearFill } from "react-icons/ri"
import { RiSunLine } from "react-icons/ri"

import DialogInfo from "./DialogInfo"

import { ReactComponent as Logo } from "../assets/logo.svg"

export default function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Upon Mount, initialize theme preference based on localStorage or system preference.
  useEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

    if (storedTheme) {
      document.documentElement.setAttribute("data-theme", storedTheme)
    }
  })

  function switchColorTheme() {
    const current = document.documentElement.getAttribute("data-theme")
    const target = current === "light" ? "dark" : "light"

    document.documentElement.setAttribute("data-theme", target)
    localStorage.setItem("theme", target)
  }

  function refreshPage() {
    window.location.href = "/"
  }

  // TODO: The logo isn't showing up on Firefox for some reason...
  // TODO: Shows up on Edge and Chrome btw.

  // TODO: Why isn't the RiMoonClearFill showing up?

  return (
    <>
      <header className="header">
        <div className="header__left" onClick={refreshPage}>
          <div className="logo">
            <Logo />
            <div className="logo__wordmark">
              <strong className="logo__wordmark--left">Wordle&nbsp;</strong>
              <strong className="logo__wordmark--right">Forever</strong>
            </div>
          </div>
        </div>
        <div className="header__right">
          <RiQuestionLine onClick={() => setIsDialogOpen(true)} className="header__svg" />
          {/* <BiBarChartAlt2 className="header__svg" /> */}
          <RiMoonClearFill className="header__svg--flipping" onClick={switchColorTheme} />
          {/* <RiSunLine className="header__svg-flipping" /> */}
        </div>
      </header>

      {isDialogOpen && <DialogInfo setIsDialogOpen={setIsDialogOpen} />}
    </>
  )
}
