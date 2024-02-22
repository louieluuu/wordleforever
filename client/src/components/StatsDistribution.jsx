function StatsDistribution({ stats }) {
  const maxStat = Math.max(...stats)
  const maxBarWidth = 8

  return (
    <div className="distribution-container">
      {stats.map((solve, index) => (
        <div className="stat" key={index}>
          {index + 1}&nbsp;&nbsp;
          <div
            className="stat-bar"
            style={{ width: `${(solve / maxStat) * maxBarWidth}rem` }}
          >
            {solve}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsDistribution
