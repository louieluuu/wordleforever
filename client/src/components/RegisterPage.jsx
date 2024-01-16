import React, { useState } from "react"

import { auth } from "../firebase"
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"

// TODO: add error handling for Register Form. undecided
// TODO: whether errors should be modals, Alert components, or just text

// Firebase gives us: invalid-email, email-already-in-use, weak-password
// We need to implement: username-already-in-use

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth)

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    )
  }
  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="auth">
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
