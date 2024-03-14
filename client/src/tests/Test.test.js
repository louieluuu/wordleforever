import { expect, test } from "vitest"
import { getSuffix } from "../components/GameContainer.jsx"

test("getSuffix", () => {
  expect(getSuffix(1)).toBe("st")
})
