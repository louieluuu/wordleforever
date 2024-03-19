// @ts-check
import { describe, test, expect } from "@playwright/test"

describe("Test container", () => {
  test("server is up", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("button", { name: "Online" }).click()

    await page.getByRole("button", { name: "Find a match" }).click()

    await expect(page.getByTestId("waiting-room")).toBeVisible()
  })

  test("can log in", async ({ page }) => {
    // Click out of tutorial
    // Click sign in button
    // Fill in email with test69@test.com
    // Fill in password with testes
    // Press Log In Button
    // You do not see the sign in button, AND you see the logout button

    await page.goto("/")

    await expect(page.getByText("Edit your name here")).toBeVisible()

    await page.getByRole("link", { name: "Sign In" }).click()

    await page.getByPlaceholder("Email").fill("test69@test.com")
    await page.getByPlaceholder("Password").fill("testes")

    await page.getByRole("button", { name: "Log In" }).click()

    //   await expect(page.getByRole("button", { name: "Logout" })).toBeVisible()
  })
})
