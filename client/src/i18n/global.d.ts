import type messages from "../../messages/vi";
import type { AppLocale } from "./config";

// Khóa chữ được kiểm tra kiểu theo tệp tiếng Việt: gõ sai khóa -> tsc báo lỗi
declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
