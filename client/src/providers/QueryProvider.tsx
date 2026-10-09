"use client";

import React, { useState } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    const client: QueryClient = new QueryClient({
      // Mọi thao tác ghi thành công đều sinh dòng nhật ký → đánh dấu cũ để tab "Nhật ký" / trang Nhật ký tự tải lại
      mutationCache: new MutationCache({
        onSuccess: () => client.invalidateQueries({ queryKey: ["audit-logs"] }),
      }),
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 1000 * 60 * 5, // 5 minutes
        },
      },
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
