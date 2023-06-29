import React, { useState } from "react"

const pulse = {
  animation: "pulse 20s infinite",
  "@keyframes pulse": {
    "0%, 100%": {
      color: "#f56a3f",
    },
    "50%": {
      color: "#9e42b0",
    },
  },

  cursor: "pointer",
}

const WelcomeMessage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState("Wordler")

  const handleUsernameClick = () => {
    setIsEditing(true)
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handleUsernameBlur = () => {
    setIsEditing(false)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: "Lobster", fontSize: "3rem" }}>
      <span style={{ marginRight: "5px" }}>Welcome,</span>
      <div style={{ position: "relative" }}>
        {isEditing ? (
          <input
            type="text"
            value={`${username}!`}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            style={{
              border: "none",
              outline: "none",
              padding: "0",
              margin: "0",
              fontSize: "inherit",
              fontFamily: "inherit",
              background: "transparent",
            }}
            autoFocus
          />
        ) : (
          <span onClick={handleUsernameClick} style={pulse}>
            {username}
          </span>
        )}
        {!isEditing && <span>!</span>}
      </div>
    </div>
  )
}

export default WelcomeMessage
