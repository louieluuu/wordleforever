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
      className="guess-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 499.67 499.67"
    >
      <title>guess-icon</title>
      <path d="M479.17,499.67H20.5A20.53,20.53,0,0,1,0,479.17V20.5A20.53,20.53,0,0,1,20.5,0H479.17a20.53,20.53,0,0,1,20.5,20.5V479.17A20.53,20.53,0,0,1,479.17,499.67ZM20.5,17A3.5,3.5,0,0,0,17,20.5V479.17a3.5,3.5,0,0,0,3.5,3.5H479.17a3.5,3.5,0,0,0,3.5-3.5V20.5a3.5,3.5,0,0,0-3.5-3.5Z" />
      <path d="M170.64,114.78v65.44s31-28.8,69.79-28.48,34.24,35.67,34.24,35.67-.22,17.45-19.13,34.22-59.17,42.44-41.2,99.9h57.18a43.1,43.1,0,0,1,2.5-44.68c6.86-8.22,6.05-9.3,32-30.35,18.08-18.62,29.95-28.6,35.08-52.89,1.89-10.79,8.1-38.31-11.33-66.11s-59.64-31.3-59.64-31.3S215.3,87.76,170.64,114.78Z" />
      <ellipse cx="246.83" cy="380.88" rx="40.27" ry="35.62" />
    </svg>
  )
}

export default GuessIcon
