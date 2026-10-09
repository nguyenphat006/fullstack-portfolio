import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Unit / component test (Vitest + Testing Library). Quy chuẩn: .claude/rules/testing.md
 *   npm test              # chạy 1 lần (CI)
 *   npm run test:watch    # chạy lại khi sửa file
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    globals: false, // import { describe, it, expect } from "vitest" tường minh
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
  },
});
