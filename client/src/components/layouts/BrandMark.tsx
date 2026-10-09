import React from "react";
import { Zap } from "lucide-react";

/** Logo ứng dụng: ảnh từ Cấu hình hệ thống, không có thì dùng biểu tượng mặc định trên nền thương hiệu */
export function BrandMark({ logoUrl, size = 36, name }: { logoUrl: string | null; size?: number; name: string }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: "var(--c-brand-gradient)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: Math.round(size / 2),
        flexShrink: 0,
      }}
    >
      <Zap style={{ width: Math.round(size / 2), height: Math.round(size / 2) }} />
    </span>
  );
}
