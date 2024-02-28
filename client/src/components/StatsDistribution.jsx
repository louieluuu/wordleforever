function StatsDistribution({ stats }) {
  const maxStat = Math.max(...stats)
  const maxBarWidth = 45

  // If you don't add some padding, 0 width ends up looking weird.
  const tinyPadding = 4

  return (
    <div className="distribution__container">
      {stats.map((solve, index) => (
        <div className="distribution__row" key={index}>
          {index + 1}
          <div
            className="distribution__bar"
            style={{
              width: `${(solve / maxStat) * maxBarWidth + tinyPadding}vw`,
            }}
          >
            {solve}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsDistribution
