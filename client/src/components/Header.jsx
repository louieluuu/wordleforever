import React, { useEffect, useState } from "react"

import { RiQuestionLine } from "react-icons/ri"
import { BiBarChartAlt2 } from "react-icons/bi"
import { FaCog } from "react-icons/fa"
import { RiMoonClearFill } from "react-icons/ri"
import { RiSunLine } from "react-icons/ri"

import InfoModal from "./InfoModal"

import Logo from "../assets/LogoGradient.svg"

export default function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

    if (storedTheme) {
      document.documentElement.setAttribute("data-theme", storedTheme)
    }

    console.log(`Initialized to: ${storedTheme} theme`)
  })

  // TODO: Navigate instead of window refreshing? (Consider the implications of not refreshing though)
  function refreshPage() {
    window.location.href = "/"
  }

  function switchColorTheme() {
    const current = document.documentElement.getAttribute("data-theme")
    const target = current === "light" ? "dark" : "light"

    document.documentElement.setAttribute("data-theme", target)
    localStorage.setItem("theme", target)

    console.log(`Switched to: ${target} theme`)
  }

  return (
    <>
      <header className="header">
        <div className="header__left" onClick={refreshPage}>
          <img src={Logo} />
          <div className="logo__wordmark">
            <b className="logo__wordmark--left">Wordle&nbsp;</b>
            <b className="logo__wordmark--right">Forever</b>
          </div>
        </div>
        <div className="header__right">
          <RiQuestionLine onClick={() => setIsDialogOpen(true)} className="header__svg" />
          <BiBarChartAlt2 className="header__svg" />
          <RiMoonClearFill className="header__svg--flipping" onClick={switchColorTheme} />
          {/* <RiSunLine className="header__svg-flipping" /> */}
        </div>
      </header>

      {isDialogOpen && <InfoModal setIsDialogOpen={setIsDialogOpen} />}
    </>
  )
}
