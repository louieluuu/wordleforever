import { Progress, Text, Group } from "@mantine/core"

import styles from "./StatsBar.module.css"

function StatsBar({ totalGames, wins, losses }) {
  const lavender = "hsl(278, 37%, 74%)"
  const dark = "dark.6"

  const winPercentage = ((wins / totalGames) * 100).toFixed(0)
  const lossPercentage = ((losses / totalGames) * 100).toFixed(0)

  return (
    <div className={styles.statsBar}>
      <Group justify="space-between">
        <Text fz="xl" c={lavender} fw={700}>
          {winPercentage}%
        </Text>

        {6}

        <Text fz="xl" c="dark.6" fw={700}>
          {lossPercentage}%
        </Text>
      </Group>

      <Progress.Root size="15" radius="xl">
        <Progress.Section value={winPercentage} color={lavender} />
        <Progress.Section value={lossPercentage} color={dark} />
      </Progress.Root>
      <Group justify="space-between">
        <Text fz="md" c={lavender} fw={400}>
          {wins} Wins
        </Text>
        <Text fz="md" c={dark} fw={400}>
          {losses} Losses
        </Text>
      </Group>
    </div>
  )
}

export default StatsBar
