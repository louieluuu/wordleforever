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

  const navigate = useNavigate()

  // Redirect to home page once user is logged in.
  // TODO: Feel like an async/await or .then() would be more
  // reliable than this useEffect.
  useEffect(() => {
    if (user) {
      const userId = user.user.uid
      console.log(`username from inside useEffect: ${username}`)
      socket.emit("createNewUser", userId, username)
      navigate("/")
    }
  }, [user, username])

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
      return res.data.isDuplicateUsername
    } catch (error) {
      console.error(`Error checking for duplicate username: ${error.message}`)
      return undefined
    }
  }

  async function validateUsername(username) {
    const validChars = /^[a-zA-Z0-9_-]+$/

    // Restrictions
    if (username.length < 1 || username.length > 20) {
      console.log("Username must be between 1-20 characters long.")
      return false
    }
    if (validChars.test(username) === false) {
      console.log(
        "Username must only contain Latin letters, numbers, '-', '_'."
      )
      return false
    }
    if (
      username.startsWith("-") ||
      username.startsWith("_") ||
      username.endsWith("-") ||
      username.endsWith("_")
    ) {
      console.log("Username cannot start or end with: '-', '_'.")
      return false
    }

    // Duplicates
    const isDuplicate = await checkDuplicateUsername(username)
    console.log(`isDuplicate: ${isDuplicate}`)

    if (isDuplicate === undefined) {
      console.log("Server error. Please try again later.")
      return false
    } else if (isDuplicate === true) {
      console.log("Username already in use.")
      return false
    } else if (isDuplicate === false) {
      return true
    }

    return false
  }

  async function register() {
    const isValid = await validateUsername(username)
    console.log(`isValid: ${isValid}`)

    if (isValid) {
      console.log("isValid. Registering...")
      createUserWithEmailAndPassword(email, password)
    }
  }

  function getErrorMessage() {
    let errorMessage = "hidden"

    if (error) {
      switch (error.code) {
        case "auth/missing-email":
          errorMessage = "Missing email address."
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          break
        case "auth/email-already-in-use":
          errorMessage = "Email already in use."
          break
        case "auth/missing-password":
          errorMessage = "Missing password."
          break
        case "auth/weak-password":
          errorMessage = "Password must be at least 6 chars long."
          break
        default:
          errorMessage = "An error occurred. Please try again."
          console.log(error.code)
      }
    }

    return errorMessage
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
        <div className={`auth__error${error ? "" : "--hidden"}`}>
          {getErrorMessage()}
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
