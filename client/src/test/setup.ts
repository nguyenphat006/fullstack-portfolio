// Matcher DOM cho Testing Library: toBeInTheDocument, toHaveTextContent...
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// globals: false -> Testing Library không tự dọn DOM sau mỗi test; thiếu dòng này component của test trước còn nằm lại
afterEach(() => {
  cleanup();
  document.cookie.split(";").forEach((c) => (document.cookie = `${c.split("=")[0].trim()}=; max-age=0`));
});
