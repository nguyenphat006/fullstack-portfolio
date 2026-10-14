import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_TAGS = new Set(["landing", "content"]);

/**
 * Backend gọi sau khi admin lưu nội dung: làm mới cache landing ngay (stale-while-revalidate),
 * người xem tiếp theo nhận nội dung mới mà không phải đợi hết thời gian cache.
 * Bảo vệ bằng header `x-revalidate-secret` = REVALIDATE_SECRET (đặt giống nhau ở Next.js và Django).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { tag } = (await request.json().catch(() => ({}))) as { tag?: string };
  if (!tag || !ALLOWED_TAGS.has(tag)) return NextResponse.json({ ok: false, error: "invalid tag" }, { status: 400 });
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, tag });
}
