import React, { useState } from "react"

import { auth } from "../firebase"
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth)

  function getErrorMessage() {
    let errorMessage

    if (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email already in use."
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          console.log("Invalid email address.")
          break
        case "auth/weak-password":
          errorMessage = "Password must be at least 6 characters long."
          break
        default:
          errorMessage = "An error occurred. Please try again."
          console.log("An error occurred. Please try again.")
      }
    }

    console.log(error.code)

    return errorMessage
  }

  return (
    <div className="auth">
      {error && <div className="auth__error">{getErrorMessage()}</div>}
      <input
        className="auth__form"
        placeholder="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="auth__form"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="auth__form"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      We will only use this for password reset.
      <button
        className="menu__btn--auth"
        onClick={() => createUserWithEmailAndPassword(email, password)}
      >
        REGISTER
      </button>
    </div>
  )
}

export default RegisterPage
