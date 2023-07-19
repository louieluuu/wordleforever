import React, { useState } from "react"

import { RiQuestionLine } from "react-icons/ri"
import { BiBarChartAlt2 } from "react-icons/bi"
import { FaCog } from "react-icons/fa"

import InfoModal from "./InfoModal"

import Logo from "../assets/LogoGradient.svg"

export default function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function refreshPage() {
    window.location.href = "/"
  }

  // TODO: The logo and title should be connected somehow
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
          <BiBarChartAlt2 className="header__svg--flipped" />
          <FaCog className="header__svg" />
        </div>
      </header>

      {isDialogOpen && <InfoModal setIsDialogOpen={setIsDialogOpen} />}
    </>
  )
}
