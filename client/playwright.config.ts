import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke test end-to-end (chạy trên hệ thống thật đang chạy: dev hoặc production).
 *
 *   E2E_BASE_URL=http://localhost:3000 E2E_USERNAME=admin E2E_PASSWORD=... npm run test:e2e
 *
 * Lần đầu cài trình duyệt: npx playwright install chromium
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
