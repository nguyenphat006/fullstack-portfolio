import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfirmProvider } from "@/components/feedback/confirm";
import vi from "../../messages/vi";

/**
 * Render component với các provider tối thiểu: chữ tiếng Việt (next-intl) + TanStack Query (không retry) + hộp xác nhận.
 * Dùng thay cho `render` của Testing Library khi component gọi useTranslations / useQuery / useConfirm.
 */
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NextIntlClientProvider locale="vi" messages={vi} timeZone="Asia/Ho_Chi_Minh">
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>{children}</ConfirmProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
