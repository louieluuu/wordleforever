import React from "react"

function StatsDistribution({ stats, isPhoneLayout }) {
  const PHONE_BAR_WIDTH = 55
  const DESKTOP_BAR_WIDTH = 25

  // https://stackoverflow.com/questions/70944210/why-is-the-spread-operator-needed-for-math-max
  const maxStat = Math.max(...stats)
  const maxBarWidth = isPhoneLayout ? PHONE_BAR_WIDTH : DESKTOP_BAR_WIDTH

  // If you don't add some padding, 0 width ends up looking weird.
  const tinyPadding = 4

  function getBarWidth(stat) {
    let barWidth

    maxStat === 0
      ? (barWidth = tinyPadding)
      : (barWidth = (stat / maxStat) * maxBarWidth + tinyPadding)

    return `${barWidth}vw`
  }

  return (
    <div className="distribution__container">
      {stats.map((stat, index) => (
        <div className="distribution__row" key={index}>
          {index + 1}
          <div
            className="distribution__bar"
            style={{
              width: getBarWidth(stat),
            }}
          >
            {stat}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsDistribution
