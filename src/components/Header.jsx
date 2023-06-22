import React, { useState } from "react"

import { HiMenu } from "react-icons/hi"
import { RiQuestionLine } from "react-icons/ri"
import { BiBarChartAlt2 } from "react-icons/bi"
import { FaCog } from "react-icons/fa"

import InfoModal from "./InfoModal"

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__left">
        <HiMenu className="header__svg" />
      </div>
      <h1>React-Wordle</h1>
      <div className="header__right">
        <RiQuestionLine onClick={() => setIsModalOpen(true)} className="header__svg" />
        <BiBarChartAlt2 className="header__svg--flipped" />
        <FaCog className="header__svg" />
      </div>
      {isModalOpen && <InfoModal />}
    </header>
  )
}
