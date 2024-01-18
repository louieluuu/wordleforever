import React, { useState } from "react"

import useSetRoomId from "../helpers/useSetRoomId"

import { auth } from "../firebase"
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth"

function ResetPasswordPage({ setRoomId }) {
  useSetRoomId(setRoomId)

  const [email, setEmail] = useState("")
  const [finalEmail, setFinalEmail] = useState("")

  const [hasReset, setHasReset] = useState(false)

  const [sendPasswordResetEmail, _, error] = useSendPasswordResetEmail(auth)

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      resetPassword()
    }
  }

  // There is no built-in variable in the firebase-hook to check for a successful submission, so I had to create one myself (hasReset).
  async function resetPassword() {
    const result = await sendPasswordResetEmail(email)

    if (result === true) {
      setHasReset(true)
      setFinalEmail(email)
      setEmail("")
    }
  }

  function getErrorMessage() {
    let errorMessage = "hidden"

    if (error) {
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address."
          break
        default:
          errorMessage = "An error occurred. Please try again."
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
        Forgot Password?
      </p>
      <div style={{ fontSize: "0.9rem" }}>
        Get a link to reset your password.
      </div>
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
        <button className="menu__btn--auth" onClick={resetPassword}>
          RESET
        </button>
        {hasReset && (
          <div style={{ maxWidth: "15rem" }}>
            Email sent to {finalEmail}. Click the link in the email to reset
            your password.
          </div>
        )}
      </div>
    </>
  )
}

export default ResetPasswordPage
