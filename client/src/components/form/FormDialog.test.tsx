import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/render";
import { FormDialog } from "./FormDialog";
import { TextField } from "./fields";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// Radix Dialog gắn `pointer-events: none` lên body ngay lúc mở; jsdom không tính lại style kịp -> bỏ kiểm tra này
const user = userEvent.setup({ pointerEventsCheck: 0 });

type Values = { code: string };

function Harness({ onSubmit, onClose = vi.fn() }: { onSubmit: (v: Values) => Promise<unknown>; onClose?: () => void }) {
  const form = useForm<Values>({ defaultValues: { code: "" } });
  return (
    <FormDialog open onClose={onClose} title="Thêm đơn vị tính" form={form} onSubmit={onSubmit}>
      <TextField<Values> name="code" label="Mã" rules={{ required: "Nhập mã" }} />
    </FormDialog>
  );
}

const serverError = (body: unknown) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, {}, { data: body, status: 400, statusText: "", headers: {}, config } as AxiosResponse);
};

describe("FormDialog", () => {
  it("validate phía client trước khi gọi onSubmit", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<Harness onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Nhập mã")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("lỗi theo trường từ backend hiện dưới ô nhập, không hiện toast", async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      serverError({ success: false, message: "Dữ liệu không hợp lệ", data: null, code: "validation_error", errors: { code: ["Mã đã tồn tại"] } }),
    );
    renderWithProviders(<Harness onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Mã/), "KG");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Mã đã tồn tại")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ code: "KG" });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("lỗi không gắn được vào ô → toast với thông báo của backend", async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      serverError({ success: false, message: "Không thể xóa: đang được sử dụng", data: null, code: "business_rule", errors: null }),
    );
    renderWithProviders(<Harness onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/Mã/), "KG");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Không thể xóa: đang được sử dụng"));
  });

  it("đóng khi chưa sửa gì → đóng ngay", async () => {
    const onClose = vi.fn();
    renderWithProviders(<Harness onSubmit={vi.fn()} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("đóng khi còn thay đổi → hỏi lại; chọn tiếp tục sửa thì không đóng, chọn bỏ thì đóng", async () => {
    const onClose = vi.fn();
    renderWithProviders(<Harness onSubmit={vi.fn()} onClose={onClose} />);
    await user.type(screen.getByLabelText(/Mã/), "KG");

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(await screen.findByText("Bỏ thay đổi chưa lưu?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tiếp tục sửa" }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    await user.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
