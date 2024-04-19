import React, { useState, useEffect } from "react"

import { Link, useNavigate } from "react-router-dom"
import useSetRoomId from "../helpers/useSetRoomId"

import { auth } from "../firebase"
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"

// React-icons
import { FaRegEye } from "react-icons/fa"
import { FaRegEyeSlash } from "react-icons/fa6"

function LoginPage({ setRoomId }) {
  useSetRoomId(setRoomId)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth)

  const navigate = useNavigate()

  // Redirect to home page once user is logged in.
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user])

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      login()
    }
  }

  function login() {
    signInWithEmailAndPassword(email, password)
  }

  // TODO - LOUIE: Wondering if there's a way to reset error back to undefined/null.
  function getErrorMessage() {
    let errorMessage = "hidden"

    if (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          break
        case "auth/missing-password":
          errorMessage = "Missing password."
          break
        case "auth/invalid-credential":
          errorMessage = "Incorrect email address or password."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later."
          break
        default:
          errorMessage = "An error occurred. Please try again."
      }
    }

    return errorMessage
  }

  return (
    <div className="auth">
      <div className={`auth__error${error ? "" : "--hidden"}`}>
        {getErrorMessage()}
      </div>
      <input
        className="auth__form"
        type="email"
        placeholder="Email"
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
      <Link
        className="text-link"
        style={{ alignSelf: "flex-end" }}
        reloadDocument
        to="/forgot"
      >
        Forgot Password?
      </Link>
      <button className="menu__btn--auth" onClick={login}>
        LOG IN
      </button>

      <div className="auth__divider">OR</div>

      <Link
        className="text-link"
        style={{ fontWeight: "500" }}
        reloadDocument
        to="/register"
      >
        New user? Register here!
      </Link>
    </div>
  )
}

export default LoginPage
