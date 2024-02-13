import React, { useState, useEffect } from "react"
import socket from "../socket"
import axios from "axios"

import { useNavigate } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

import { auth } from "../firebase"
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"

function RegisterPage({ setRoomId }) {
  useSetRoomId(setRoomId)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth)

  const [errorMessage, setErrorMessage] = useState("")

  const navigate = useNavigate()

  // Redirect to home page once user is logged in.
  // TODO: Feel like an async/await or .then() would be more
  // reliable than this useEffect.

  // TODO: Also, it would be nice if the email/pw errors had
  // prio over the username errors, but the order would have to change and it's not trivial. (prob can't use the firebase-hook)
  useEffect(() => {
    if (user) {
      const userId = user.user.uid
      socket.emit("createNewUser", userId, username)
      navigate("/")
    }
  }, [user, username])

  useEffect(() => {
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
  }, [error])

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      register()
    }
  }

  async function checkDuplicateUsername(username) {
    try {
      const res = await axios.get(
        `http://localhost:3005/users/duplicate/${username}`
      )
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
    const validUsername = await validateUsername(username)
    if (validUsername) {
      createUserWithEmailAndPassword(email, password)
    }
  }

  return (
    <>
      <p
        style={{
          fontSize: "1.75rem",
          fontWeight: "500",
          marginBottom: "0.2rem",
        }}
      >
        Register
      </p>
      <div style={{ fontSize: "0.9rem" }}></div>

      <div className="auth">
        <div className={`auth__error${errorMessage ? "" : "--hidden"}`}>
          {errorMessage}
        </div>
        <input
          className="auth__form"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="auth__form"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
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
