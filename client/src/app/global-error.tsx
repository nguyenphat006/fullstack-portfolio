"use client"; // Error boundary bắt buộc là Client Component

import { THEME_INIT_SCRIPT } from "@/stores/useThemeStore";
import { APP_CONFIG } from "@/config/app";
import { readClientLocale } from "@/i18n/config";

// Ngoài NextIntlClientProvider (thay cả root layout) -> chữ tự chọn theo cookie ngôn ngữ
const TEXT = {
  vi: { title: "Lỗi hệ thống", heading: "Đã xảy ra lỗi hệ thống", body: "Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.", retry: "Thử lại" },
  en: { title: "System error", heading: "A system error occurred", body: "The application ran into an unexpected problem. Please try again.", retry: "Try again" },
};

/**
 * Lỗi ở root layout: thay thế toàn bộ document, KHÔNG có globals.css / antd -> style inline tối giản,
 * tự đọc theme đã lưu qua THEME_INIT_SCRIPT.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const locale = readClientLocale();
  const text = TEXT[locale];
  return (
    <html lang={locale}>
      <head>
        <title>{`${text.title} | ${APP_CONFIG.name}`}</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <style>{`
          body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8FAFC;color:#0F172A;
            display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}
          [data-theme=dark] body{background:#0B1120;color:#E2E8F0}
          button{margin-top:16px;padding:8px 20px;border:0;border-radius:8px;background:#1E40AF;color:#fff;font-size:14px;cursor:pointer}
          p{opacity:.7}
        `}</style>
      </head>
      <body>
        <main>
          <h2>{text.heading}</h2>
          <p>{text.body}</p>
          <button onClick={() => retry()}>{text.retry}</button>
        </main>
      </body>
    </html>
  );
}
