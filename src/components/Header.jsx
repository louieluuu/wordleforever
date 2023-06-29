import React, { useState } from "react"

import { HiMenu } from "react-icons/hi"
import { RiQuestionLine } from "react-icons/ri"
import { BiBarChartAlt2 } from "react-icons/bi"
import { FaCog } from "react-icons/fa"

import InfoModal from "./InfoModal"

import Logo3 from "../assets/LogoGradient.svg"

export default function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function refreshPage() {
    window.location.href = "/"
  }

  // TODO: The logo and title should be connected somehow
  return (
    <>
      <header className="header">
        {/* <div className="header__left">
          <HiMenu className="header__svg" />
        </div> */}
        <img src={Logo3} className="header__logo" onClick={refreshPage} />
        <h1 className="header__title" onClick={refreshPage}>
          Wordle Forever
        </h1>
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
