import React from "react"

// Putting a note here for posterity.

// We need this GuessIcon to render a different color based on light/dark mode.

// Trying to reach the class "guess-icon" through the pure SVG file didn't work (with the "class" attribute).
// Trying to import as a Component with "?react" would not fill the SVG properly. It would fill the entire square instead of the paths inside the square.

// The permutation that works is making the SVG a React component and using the "className" attribute.

// 2 hours well spent.

// :D

function GuessIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 499.67 499.67"
    >
      <title>guess-icon</title>
      <path
        className="guess-icon__question"
        d="M170.64,114.78v65.44s31-28.8,69.79-28.48,34.24,35.67,34.24,35.67-.22,17.45-19.13,34.22-59.17,42.44-41.2,99.9h57.18a43.1,43.1,0,0,1,2.5-44.68c6.86-8.22,6.05-9.3,32-30.35,18.08-18.62,29.95-28.6,35.08-52.89,1.89-10.79,8.1-38.31-11.33-66.11s-59.64-31.3-59.64-31.3S215.3,87.76,170.64,114.78Z"
        transform="translate(0 0)"
      />
      <ellipse
        className="guess-icon__question"
        cx="246.83"
        cy="380.88"
        rx="40.27"
        ry="35.62"
      />
      {/* Left-top border */}
      <path
        className="guess-icon__border--left-top"
        d="M20.5,0S0-.33,0,20.5V479.17s.25,16.58,17,20.33V20.5A3.43,3.43,0,0,1,20.5,17H499.25S496.59,0,479.17,0Z"
        transform="translate(0 0)"
      />
      {/* Right-bot border */}
      <path
        className="guess-icon__border--right-bot"
        d="M479.19,499.68s20.5.33,20.5-20.5V20.51s-.25-16.58-17-20.33v479a3.43,3.43,0,0,1-3.5,3.5H.44s2.66,17,20.08,17Z"
        transform="translate(0 0)"
      />
    </svg>
  )
}

export default GuessIcon
