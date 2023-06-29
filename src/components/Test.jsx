import React, { useState, useEffect, useRef } from "react"

const WelcomeMessage = () => {
  const textBoxRef = useRef(null)

  // useEffect(() => {
  //   function resizeInput() {
  //     const length = textBoxRef.current.value.length

  //     let modifier

  //     switch (true) {
  //       case length >= 0 && length <= 4:
  //         modifier = 0.95
  //         break
  //       case length >= 5 && length <= 9:
  //         modifier = 0.9
  //         break
  //       case length >= 10 && length <= 14:
  //         modifier = 0.85
  //         break
  //       case length >= 15 && length <= 19:
  //         modifier = 0.8
  //         break
  //       default:
  //         modifier = 0
  //         break
  //     }

  //     textBoxRef.current.style.width = `${length * modifier}ch`
  //     console.log(textBoxRef.current.style.width)
  //   }

  //   const textBox = textBoxRef.current
  //   textBox.addEventListener("input", resizeInput)
  //   resizeInput.call(textBox)
  // }, [textBoxRef])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontFamily: "Lobster",
        fontSize: "3rem",
      }}>
      <label>
        Welcome,&nbsp;
        <input
          ref={textBoxRef}
          defaultValue={"Wordler!"}
          style={{
            border: "none",
            outline: "none",
            font: "inherit",
            // boxSizing: "content-box",
            paddingRight: 0,
          }}
        />
      </label>
    </div>
  )
}

export default WelcomeMessage
