import React, { useState } from "react"
import socket from "../socket"
import axios from "axios"

import { useNavigate } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

import { auth } from "../firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

import containsBadWord from "../helpers/nameFilter"

// React-icons
import { FaRegEye } from "react-icons/fa"
import { FaRegEyeSlash } from "react-icons/fa6"

function RegisterPage({ setRoomId }) {
  useSetRoomId(setRoomId)

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [username, setUsername] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  function printFirebaseError(error) {
    if (error) {
      switch (error.code) {
        case "auth/missing-email":
          setErrorMessage("Missing email address.")
          break
        case "auth/invalid-email":
          setErrorMessage("Invalid email address.")
          break
        case "auth/email-already-in-use":
          setErrorMessage("Email already in use.")
          break
        case "auth/missing-password":
          setErrorMessage("Missing password.")
          break
        case "auth/weak-password":
          setErrorMessage("Password must be at least 6 chars long.")
          break
        default:
          setErrorMessage("An error occurred. Please try again.")
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      register()
    }
  }

  async function checkDuplicateUsername(username) {
    const SERVER_URL =
      process.env.NODE_ENV === "production"
        ? import.meta.env.VITE_EC2_URL
        : `${import.meta.env.VITE_IP_ADDR}:3005`

    try {
      const res = await axios.get(`${SERVER_URL}/users/duplicate/${username}`)
      return res.data?.isDuplicateUsername
    } catch (error) {
      console.error(`Error checking for duplicate username: ${error.message}`)
      return undefined
    }
  }

  async function validateUsername(username) {
    const validChars = /^[a-zA-Z0-9_-]+$/

    // Restrictions
    if (username.length < 1 || username.length > 20) {
      setErrorMessage("Username must be between 1-20 characters long.")
      return false
    }
    if (validChars.test(username) === false) {
      setErrorMessage("Username must only contain a-z, 0-9, '-', '_'.")
      return false
    }
    if (
      username.startsWith("-") ||
      username.startsWith("_") ||
      username.endsWith("-") ||
      username.endsWith("_")
    ) {
      setErrorMessage("Username cannot start or end with: '-', '_'.")
      return false
    }
    if (containsBadWord(username)) {
      console.log(`Bad word detected: ${username}`)
      setErrorMessage("Username is not acceptable.")
      return false
    }

    // Duplicates
    const isDuplicate = await checkDuplicateUsername(username)

    if (isDuplicate === undefined) {
      setErrorMessage("Server error. Please try again later.")
      return false
    } else if (isDuplicate === true) {
      setErrorMessage("Username already in use.")
      return false
    } else if (isDuplicate === false) {
      return true
    }

    return false
  }

  async function register() {
    // TODO: error handling could be better here: what if socket.emit fails?

    const isValidUsername = await validateUsername(username)
    if (isValidUsername) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
        await updateProfile(auth.currentUser, {
          displayName: username,
        })
        const userId = userCredential.user.uid
        socket.emit("createNewUser", userId, username)
        navigate("/")
      } catch (error) {
        printFirebaseError(error)
      }
    }
  }

  return (
    <>
      <p
        style={{
          fontSize: "1.75rem",
          fontWeight: "500",
          marginBottom: "1rem",
        }}
      >
        Create Your Free Account
      </p>

      <ul>
        <li>Record your play stats!</li>
        <li>Track your streak!</li>
        <li>Unlock ranks and titles!</li>
      </ul>

      <div className="auth">
        <div className={`auth__error${errorMessage ? "" : "--hidden"}`}>
          {errorMessage}
        </div>
        Email and password will be used to log in.
        <input
          className="auth__form"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div style={{ position: "relative" }}>
          <input
            className="auth__form--password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </div>
        </div>
        <div style={{ marginBlock: "1rem" }}></div>
        <span
          style={{ cursor: "help" }}
          title="You can still change your in-game display name at any time."
        >
          Choose a name to be{" "}
          <span
            style={{
              textDecoration: "underline",
              textDecorationStyle: "dashed",
              textDecorationColor: "hsl(197, 100%, 40%)",
            }}
          >
            linked to your account.
          </span>
        </span>
        <input
          className="auth__form"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="menu__btn--auth" onClick={register}>
          REGISTER
        </button>
      </div>
    </>
  )
}

export default RegisterPage
