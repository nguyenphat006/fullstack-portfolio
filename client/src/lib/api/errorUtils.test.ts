import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { renderHook } from "@testing-library/react";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { extractErrorMessage, extractErrorMessageAsync, getErrorCode, getFieldErrors } from "./errorUtils";
import { applyServerErrors } from "./formErrors";

/** Lỗi axios giả lập với body backend trả về (không có body = lỗi mạng) */
function axiosError(data?: unknown, status = 400) {
  const config = { headers: new AxiosHeaders() };
  const response = data === undefined ? undefined : ({ data, status, statusText: "", headers: {}, config } as AxiosResponse);
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, {}, response);
}

const envelope = (patch: Record<string, unknown>) => ({ success: false, message: "Dữ liệu không hợp lệ", data: null, errors: null, code: "validation_error", ...patch });

describe("extractErrorMessage", () => {
  it("ưu tiên message của envelope backend", () => {
    expect(extractErrorMessage(axiosError(envelope({ message: "Mã đã tồn tại" })))).toBe("Mã đã tồn tại");
  });

  it("đọc `detail` của lỗi không theo envelope", () => {
    expect(extractErrorMessage(axiosError({ detail: "Không có quyền" }, 403))).toBe("Không có quyền");
  });

  it("lỗi mạng → thông báo theo ngôn ngữ trong cookie", () => {
    expect(extractErrorMessage(axiosError())).toMatch(/^Không thể kết nối/);
    document.cookie = "NEXT_LOCALE=en";
    expect(extractErrorMessage(axiosError())).toMatch(/^Cannot reach the server/);
  });

  it("chuỗi, Error, giá trị lạ → luôn trả chuỗi", () => {
    expect(extractErrorMessage("Lỗi riêng")).toBe("Lỗi riêng");
    expect(extractErrorMessage(new Error("boom"))).toBe("boom");
    expect(extractErrorMessage({ foo: 1 }, "Mặc định")).toBe("Mặc định");
    expect(extractErrorMessage(axiosError({ weird: true }, 500), "Mặc định")).toBe("Request failed");
  });

  it("đọc envelope JSON nằm trong Blob (request tải file)", async () => {
    const blob = new Blob([JSON.stringify(envelope({ message: "Không có dữ liệu để xuất" }))], { type: "application/json" });
    await expect(extractErrorMessageAsync(axiosError(blob))).resolves.toBe("Không có dữ liệu để xuất");
  });
});

describe("getErrorCode / getFieldErrors", () => {
  it("trả mã lỗi và lỗi theo trường của envelope, null nếu không phải envelope", () => {
    const err = axiosError(envelope({ code: "business_rule", errors: { code: ["Trùng"] } }));
    expect(getErrorCode(err)).toBe("business_rule");
    expect(getFieldErrors(err)).toEqual({ code: ["Trùng"] });
    expect(getErrorCode(new Error("x"))).toBeNull();
  });
});

describe("applyServerErrors", () => {
  const setup = () => renderHook(() => useForm({ defaultValues: { code: "", name: "" } })).result.current;

  it("gắn lỗi vào đúng ô, nối nhiều thông báo", () => {
    const form = setup();
    const applied = applyServerErrors(form, axiosError(envelope({ errors: { code: ["Mã đã tồn tại", "Tối đa 20 ký tự"] } })));
    expect(applied).toBe(true);
    expect(form.getFieldState("code").error?.message).toBe("Mã đã tồn tại Tối đa 20 ký tự");
  });

  it("bỏ qua trường không có trong form → trả false để nơi gọi hiện toast", () => {
    const form = setup();
    expect(applyServerErrors(form, axiosError(envelope({ errors: { non_field_errors: ["Sai"] } })))).toBe(false);
    expect(applyServerErrors(form, new Error("x"))).toBe(false);
  });
});
