import React, { useState } from "react"

import { Link } from "react-router-dom"

import { auth } from "../firebase"
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth)

  function getErrorMessage() {
    let errorMessage

    if (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          console.log("Invalid email address.")
          break
        case "auth/user-not-found":
          console.log("No account found with this email address.")
          break
        case "auth/missing-password":
          errorMessage = "Missing password."
          console.log("Missing password.")
          break
        case "auth/invalid-credential":
          errorMessage =
            "Incorrect email address or password. Check that you have entered the correct email address and password, and try again."
          console.log("Incorrect email address or password.")
          break
        default:
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
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="auth__form"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Link style={{ alignSelf: "flex-end" }} reloadDocument to="/forgot">
        Forgot Password?
      </Link>
      <button
        className="menu__btn--auth"
        onClick={() => signInWithEmailAndPassword(email, password)}
      >
        LOG IN
      </button>

      <div className="auth__divider">OR</div>

      <button className="menu__btn--auth--google">GOOGLE</button>
      <button className="menu__btn--auth--google">GOOGLE</button>

      <Link style={{ fontWeight: "500" }} reloadDocument to="/register">
        New user? Register here!
      </Link>
    </div>
  )
}

export default LoginPage
