// TODO: Would be cool to add jewels to the Crown svg based on the number of Crowns. (100 Crowns being the threshold for max jewels, probably?)

import React from "react"

function Crown({ matches }) {
  function getCrownClassName() {
    return matches === 0 ? "--near-invisible" : ""
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 8.49 12.01"
    >
      <title>crown</title>
      <path
        className={`crown__left${getCrownClassName()}`}
        d="M0,9.92a.64.64,0,0,0,.12.31A6.89,6.89,0,0,0,4.27,12V.05A.44.44,0,0,0,4,.33L2.19,4.88.69.33S.47,0,.32,0,.09.16,0,.54"
        transform="translate(-0.02 -0.03)"
      />
      <path
        className={`crown__right${getCrownClassName()}`}
        d="M8.48,9.91a.55.55,0,0,1-.12.31A6.89,6.89,0,0,1,4.25,12V0a.44.44,0,0,1,.32.28L6.33,4.87,7.83.32S8.05,0,8.2,0s.23.12.3.5"
        transform="translate(-0.02 -0.03)"
      />
    </svg>
  )
}

export default Crown
