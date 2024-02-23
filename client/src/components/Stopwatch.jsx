import React from "react"

function Stopwatch({ time }) {
  //   const strokeColor = "#cea4d5"
  const strokeColor = "hsl(0, 0%, 75%)"

  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  return (
    <p style={{ position: "relative" }}>
      <svg
        className="svg-stopwatch"
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 411 508.83"
      >
        <title>Stopwatch</title>
        <circle
          cx="205.5"
          cy="303.33"
          r="192"
          fill="none"
          stroke={strokeColor}
          stroke-miterlimit="10"
          stroke-width="27"
        />
        <line
          x1="205"
          y1="123.33"
          x2="205"
          y2="174.67"
          fill="none"
          stroke={strokeColor}
          stroke-linecap="round"
          stroke-miterlimit="10"
          stroke-width="35"
        />
        <path
          d="M224,83.56V65s-16-.75-16-16V17s1.13-16,16-16h64s16,.63,16,16V49s-.87,16-16,16V83.56Z"
          transform="translate(-50.5 -1)"
          fill={strokeColor}
        />
        <path
          d="M339.5,97.31,340,95.5l16.24-28.19s9-13.56,21.88-5.87,27.68,16,27.68,16,13.6,9.18,5.88,21.87l-16,27.69L394,128.94A194.59,194.59,0,0,0,339.5,97.31Z"
          transform="translate(-50.5 -1)"
          fill={strokeColor}
        />
      </svg>

      <svg
        style={{ position: "absolute", top: "0", left: "0" }}
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 411 508.83"
      >
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8rem"
          fontWeight="bold"
          fontFamily="Roboto Slab"
        >
          {formattedTime}
        </text>
      </svg>
    </p>
  )
}

export default Stopwatch
