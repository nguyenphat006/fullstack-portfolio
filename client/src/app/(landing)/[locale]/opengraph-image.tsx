import { ImageResponse } from "next/og";
import { getContent, isLocale, LOCALES } from "@/content";

export const alt = "ERICSS - Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Ảnh chia sẻ mạng xã hội (Open Graph / Twitter) sinh theo ngôn ngữ, không cần file tĩnh. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { shared } = getContent(isLocale(locale) ? locale : "vi");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0E0E0E 0%, #1f1147 60%, #0b3a3a 100%)",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#a5b4fc" }}>{shared.meta.jobTitle}</div>
        <div style={{ fontSize: 132, fontWeight: 900, marginTop: 16, lineHeight: 1.05 }}>ERICSS</div>
        <div style={{ fontSize: 44, marginTop: 8 }}>Nguyen Dang Phat</div>
        <div style={{ fontSize: 28, marginTop: 32, color: "#d4d4d8", maxWidth: 900 }}>Next.js · TypeScript · Django</div>
      </div>
    ),
    size,
  );
}
