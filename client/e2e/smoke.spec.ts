import { expect, test, type Page } from "@playwright/test";

const USERNAME = process.env.E2E_USERNAME || "admin";
const PASSWORD = process.env.E2E_PASSWORD || "";

/** Các màn hình lõi của template */
const CORE_PAGES = ["/dashboard", "/users", "/audit-logs", "/settings/modules", "/profile"];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function login(page: Page) {
  await page.goto("/login");
  await page.locator("input:not([type=password])").first().fill(USERNAME);
  await page.locator("input[type=password]").fill(PASSWORD);
  await page.locator("button[type=submit]").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.beforeAll(() => {
  if (!PASSWORD) throw new Error("Thiếu E2E_PASSWORD (mật khẩu tài khoản dùng cho smoke test)");
});

test("đăng nhập sai hiển thị thông báo, không chuyển trang", async ({ page }) => {
  await page.goto("/login");
  await page.locator("input:not([type=password])").first().fill(USERNAME);
  await page.locator("input[type=password]").fill("sai-mat-khau-123");
  await page.locator("button[type=submit]").click();
  await expect(page.locator("div[role=alert], [data-sonner-toast], .form-field__error").first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("đăng nhập và mở các màn hình lõi không lỗi", async ({ page }) => {
  const errors = trackErrors(page);
  await login(page);

  for (const path of CORE_PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.getByText("404 - Không tìm thấy trang")).toHaveCount(0);
    await expect(page.getByText("Đã xảy ra lỗi")).toHaveCount(0);
  }
  expect(errors, `Lỗi trình duyệt:\n${errors.join("\n")}`).toEqual([]);
});

test("trạng thái hệ thống lấy từ /health/", async ({ page }) => {
  await login(page);
  await page.goto("/dashboard");
  await expect(page.getByText("Trạng thái hệ thống")).toBeVisible();
  await expect(page.getByText("Cơ sở dữ liệu")).toBeVisible();
  await expect(page.getByText(/Hoạt động · [\d.]+ ms/).first()).toBeVisible();
});

test("chuyển giao diện tối được lưu sau khi tải lại", async ({ page }) => {
  await login(page);
  await page.evaluate(() => localStorage.setItem("portfolio_admin_theme_mode", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.evaluate(() => localStorage.setItem("portfolio_admin_theme_mode", "light"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("đường dẫn không tồn tại hiển thị trang 404", async ({ page }) => {
  await page.goto("/duong-dan-khong-ton-tai");
  await expect(page.getByText("404 - Không tìm thấy trang")).toBeVisible();
});

test("Ctrl+K tìm và mở màn hình theo menu", async ({ page, isMobile }) => {
  test.skip(isMobile, "Phím tắt chỉ kiểm tra trên desktop");
  await login(page);
  await page.goto("/dashboard");
  // Chờ topbar hiện (phím tắt gắn khi layout đã mount)
  await expect(page.getByRole("button", { name: /Tìm kiếm/ })).toBeVisible();
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder("Tìm màn hình hoặc thao tác…");
  await expect(input).toBeVisible();
  await input.fill("nguoi dung");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/users$/);
});
