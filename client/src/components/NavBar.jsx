// TODO: Logout should reload back to home page, it feels super weird when it doesn't.

// TODO: "reloadDocument to=" vs. "to="

import React, { useState, useLayoutEffect } from "react"

import { Link, useNavigate } from "react-router-dom"

import { auth } from "../firebase"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"

import { BiBarChartAlt2 } from "react-icons/bi"
import { BsInfoCircle } from "react-icons/bs"
import { RiMoonClearFill } from "react-icons/ri"
import { ImExit } from "react-icons/im"

import Logo from "../assets/logo.svg"

import InfoDialog from "./InfoDialog"

function NavBar({ roomId, isPhoneLayout }) {
  const navigate = useNavigate()

  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [colorTheme, setColorTheme] = useState("")

  const [user, loadingUser, errorUser] = useAuthState(auth)
  const [logout, loading, error] = useSignOut(auth)

  // Upon Mount, initialize theme preference based on localStorage or system preference.
  useLayoutEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")

    if (storedTheme) {
      document.documentElement.setAttribute("data-theme", storedTheme)
    }

    setColorTheme(storedTheme)
  })

  function switchColorTheme() {
    const current = document.documentElement.getAttribute("data-theme")
    const target = current === "light" ? "dark" : "light"

    document.documentElement.setAttribute("data-theme", target)
    localStorage.setItem("theme", target)

    setColorTheme(target)
  }

  function getColorThemeClassName() {
    let colorThemeClassName = "navbar__color-theme"
    if (colorTheme === "dark") {
      colorThemeClassName += " dark"
    } else {
      colorThemeClassName += " light"
    }
    return colorThemeClassName
  }

  function openInfoDialog() {
    setShowInfoDialog(true)
  }

  // The following navbar actions would take a player out of an active game, so they should be confirmed.

  function handleClickStats() {
    if (user) {
      navigate(`/user/${user.displayName}`)
    } else {
      // TODO:
      console.log("Must be logged in to view stats :(")
    }
  }

  function refreshPage() {
    window.location.href = "/"
  }

  return (
    <>
      <InfoDialog show={showInfoDialog} setShow={setShowInfoDialog} />
      <header className="navbar">
        <div className="navbar__left" onClick={refreshPage}>
          <div className="logo">
            <img src={Logo} alt="Logo" />
            {!isPhoneLayout && (
              <div className="logo__wordmark">
                <strong className="logo__wordmark--left">Words&nbsp;</strong>
                <strong className="logo__wordmark--right">Forever</strong>
              </div>
            )}
          </div>
        </div>
        <div className="navbar__right">
          <BsInfoCircle
            className="navbar__info"
            title="Info"
            onClick={openInfoDialog}
          />
          <BiBarChartAlt2
            className="navbar__stats"
            title="Statistics"
            onClick={handleClickStats}
          />
          <RiMoonClearFill
            className={getColorThemeClassName()}
            title="Switch color theme"
            onClick={switchColorTheme}
          />
          {!roomId ? (
            user ? (
              <ImExit
                className="navbar__logout"
                title="Logout"
                onClick={logout}
                data-testid="logout-button"
              />
            ) : (
              <Link
                className="navbar__login"
                reloadDocument
                to="/login"
                data-testid="login-button"
              >
                Sign In
              </Link>
            )
          ) : null}
        </div>
      </header>
    </>
  )
}

export default NavBar
