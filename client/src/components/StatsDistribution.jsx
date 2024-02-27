function StatsDistribution({ stats }) {
  const maxStat = Math.max(...stats)
  const maxBarWidth = 8

  const tinyPadding = 0.5

  return (
    <div className="distribution__container">
      {stats.map((solve, index) => (
        <div className="distribution__row" key={index}>
          {index + 1}
          <div
            className="distribution__bar"
            style={{
              width: `${(solve / maxStat) * maxBarWidth + tinyPadding}rem`,
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
