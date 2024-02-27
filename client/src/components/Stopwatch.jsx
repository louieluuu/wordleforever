import React from "react"

function Stopwatch({ time }) {
  const minutes = Math.floor(time / 60)
  const seconds = (time % 60).toFixed(0)
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  function getStopwatchClassName() {
    let stopwatchClassName = "svg-stopwatch"

    if (time >= 60) {
      stopwatchClassName += "--bronze"
    }
    //
    else if (time < 60 && time >= 30) {
      stopwatchClassName += "--silver"
    }
    //
    else if (time < 30 && time >= 15) {
      stopwatchClassName += "--gold"
    }
    //
    else {
      stopwatchClassName += "--platinum"
    }

    return stopwatchClassName
  }

  return (
    <div style={{ position: "relative" }}>
      <svg
        className={getStopwatchClassName()}
        xmlns="http://www.w3.org/2000/svg"
        width="411"
        height="508.83"
        viewBox="0 0 411 508.83"
      >
        <circle
          cx="205.5"
          cy="303.33"
          r="192"
          fill="none"
          stroke={null}
          strokeMiterlimit="10"
          strokeWidth="27"
        />
        <line
          x1="205"
          y1="123.33"
          x2="205"
          y2="174.67"
          fill="none"
          stroke={null}
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="35"
        />
        <path
          d="M224,83.56V65s-16-.75-16-16V17s1.13-16,16-16h64s16,.63,16,16V49s-.87,16-16,16V83.56Z"
          transform="translate(-50.5 -1)"
          fill={null}
        />
        <path
          d="M339.5,97.31,340,95.5l16.24-28.19s9-13.56,21.88-5.87,27.68,16,27.68,16,13.6,9.18,5.88,21.87l-16,27.69L394,128.94A194.59,194.59,0,0,0,339.5,97.31Z"
          transform="translate(-50.5 -1)"
          fill={null}
        />
      </svg>

      <svg
        className="svg-stopwatch__text"
        style={{ position: "absolute", top: "0", left: "0" }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 411 508.83"
      >
        <text
          x="50%"
          y="64%"
          width="411"
          height="508.83"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formattedTime}
        </text>
      </svg>
    </div>
  )
}

export default Stopwatch
