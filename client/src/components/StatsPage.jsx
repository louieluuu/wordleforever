import { useState, useEffect } from "react"
import axios from "axios"

import { SegmentedControl } from "@mantine/core"
import classes from "./GradientSegmentedControl.module.css"

function StatsPage() {
  const [connectionModePath, setConnectionModePath] = useState(
    localStorage.getItem("connectionModePath") || "public"
  )
  const [gameModePath, setGameModePath] = useState(
    localStorage.getItem("gameModePath") || "normal"
  )

  useEffect(() => {
    const statsPath = `stats.${connectionModePath}.${gameModePath}`
    console.log(`statsPath: ${statsPath}`)
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
    </>
  )
}

export default StatsPage
