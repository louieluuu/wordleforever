import React, { useState } from "react"

import { auth } from "../firebase"
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth)

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="auth">
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
      <button
        className="menu__btn--auth"
        onClick={() => signInWithEmailAndPassword(email, password)}
      >
        LOG IN
      </button>
      <hr
        style={{
          marginBlock: "1.3rem",
          borderColor: "black",
          borderWidth: "1px",
        }}
      />
    </div>
  )
}

export default LoginPage
