import { useState, useEffect } from "react"
import axios from "axios"

import { SegmentedControl } from "@mantine/core"
import classes from "./GradientSegmentedControl.module.css"

function StatsPage() {
  const [userStats, setUserStats] = useState({})
  const [connectionModePath, setConnectionModePath] = useState(
    localStorage.getItem("connectionModePath") || "public"
  )
  const [gameModePath, setGameModePath] = useState(
    localStorage.getItem("gameModePath") || "normal"
  )

  useEffect(() => {
    const userId = "5bps9cZRCSMKiM362Ayo43PHmRq2"
    const statsPath = `user/${userId}/${connectionModePath}/${gameModePath}`
    console.log(`statsPath: ${statsPath}`)

    // TODO: Change to production URL.
    // TODO: Would like to use await syntax, but useEffect can't be async.
    axios.get(`http://localhost:3005/${statsPath}`).then((res) => {
      console.log(res.data)
      setUserStats(res.data)
    })
  }, [connectionModePath, gameModePath])

  function changeConnectionModePath(value) {
    localStorage.setItem("connectionModePath", value)
    setConnectionModePath(value)
  }

  function changeGameModePath(value) {
    localStorage.setItem("gameModePath", value)
    setGameModePath(value)
  }

  return (
    <>
      <SegmentedControl
        radius="lg"
        size="lg"
        value={connectionModePath}
        data={[
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
        ]}
        classNames={classes}
        onChange={changeConnectionModePath}
      />

      <SegmentedControl
        radius="lg"
        size="lg"
        value={gameModePath}
        data={[
          { value: "normal", label: "Normal" },
          { value: "challenge", label: "Challenge" },
        ]}
        classNames={classes}
        onChange={changeGameModePath}
      />

      <h1>Stats</h1>
      {Object.entries(userStats).map(([key, value]) => (
        <p key={key}>{`${key}: ${value}`}</p>
      ))}
    </>
  )
}

export default StatsPage
