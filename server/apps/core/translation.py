"""
Dịch văn bản VI -> EN miễn phí cho nút "Dịch tự động" ở trang quản trị (Dự án, Bài viết).

Thứ tự thử (cấu hình bằng TRANSLATE_PROVIDERS, mặc định "google,mymemory"):
  1. google    — dịch vụ web của Google qua thư viện deep-translator (không cần khóa; không chính thức, đôi khi bị chặn tần suất)
  2. mymemory  — MyMemory API (miễn phí 5.000 ký tự/ngày; đặt MYMEMORY_EMAIL để lên 50.000 ký tự/ngày)

Văn bản Markdown được xử lý để giữ nguyên: khối code (```), code nội dòng, URL, ảnh/liên kết (chỉ dịch phần chữ hiển thị
của liên kết), thẻ HTML. Văn bản dài được cắt theo dòng/câu để không vượt giới hạn mỗi lần gọi.
"""
import logging
import os
import re
import time

logger = logging.getLogger(__name__)

MAX_CHUNK = 450  # MyMemory giới hạn ~500 ký tự mỗi lần gọi
FENCE_RE = re.compile(r'```.*?```', re.S)
INLINE_CODE_RE = re.compile(r'`[^`\n]+`')
URL_RE = re.compile(r'https?://[^\s)\]>"\']+')
HTML_TAG_RE = re.compile(r'<[^>\n]+>')
LINK_TARGET_RE = re.compile(r'(\]\()([^)\s]+)(\))')  # phần (url) của [chữ](url) / ![alt](src)


class TranslationError(Exception):
    """Không dịch được bằng bất kỳ nhà cung cấp nào."""


def _protect(text: str):
    """Thay các đoạn không được dịch bằng token ⟦n⟧; trả (văn bản đã che, danh sách gốc)."""
    saved: list[str] = []

    def stash(match):
        saved.append(match.group(0))
        return f'⟦{len(saved) - 1}⟧'

    for pattern in (FENCE_RE, INLINE_CODE_RE, HTML_TAG_RE):
        text = pattern.sub(stash, text)
    text = LINK_TARGET_RE.sub(lambda m: m.group(1) + stash(re.match(r'.*', m.group(2))) + m.group(3), text)
    text = URL_RE.sub(stash, text)
    return text, saved


def _restore(text: str, saved: list[str]) -> str:
    for i, original in enumerate(saved):
        text = re.sub(rf'⟦\s*{i}\s*⟧', lambda _m, o=original: o, text)
    return text


def _split_long(line: str) -> list[str]:
    """Cắt một dòng dài theo câu (mỗi mảnh <= MAX_CHUNK); dòng ngắn giữ nguyên."""
    if len(line) <= MAX_CHUNK:
        return [line]
    parts, buf = [], ''
    for sentence in re.split(r'(?<=[.!?。])\s+', line):
        while len(sentence) > MAX_CHUNK:  # câu quá dài: cắt cứng
            if buf:
                parts.append(buf)
                buf = ''
            parts.append(sentence[:MAX_CHUNK])
            sentence = sentence[MAX_CHUNK:]
        if buf and len(buf) + 1 + len(sentence) > MAX_CHUNK:
            parts.append(buf)
            buf = sentence
        else:
            buf = f'{buf} {sentence}'.strip()
    if buf:
        parts.append(buf)
    return parts


def _google(text: str, source: str, target: str) -> str:
    from deep_translator import GoogleTranslator
    return GoogleTranslator(source=source, target=target).translate(text)


def _mymemory(text: str, source: str, target: str) -> str:
    from deep_translator import MyMemoryTranslator
    codes = {'vi': 'vi-VN', 'en': 'en-GB'}
    email = os.getenv('MYMEMORY_EMAIL') or None
    return MyMemoryTranslator(source=codes.get(source, source), target=codes.get(target, target), email=email).translate(text)


PROVIDERS = {'google': _google, 'mymemory': _mymemory}
COOLDOWN_SECONDS = 600
_disabled_until: dict[str, float] = {}  # nhà cung cấp vừa bị chặn tần suất -> tạm bỏ qua để không chờ vô ích


def _translate_line(line: str, source: str, target: str, providers: list[str]) -> str:
    if not re.search(r'[^\W\d_]', re.sub(r'⟦\d+⟧', '', line)):  # không có chữ nào (chỉ số / ký hiệu / token)
        return line
    lead = re.match(r'^(\s*(?:[-*+]|\d+\.|#{1,6}|>)*\s*)', line).group(1)  # giữ dấu danh sách / tiêu đề
    body = line[len(lead):]
    last_error: Exception | None = None
    for name in providers:
        if _disabled_until.get(name, 0) > time.monotonic():
            continue
        try:
            return lead + (PROVIDERS[name](body, source, target) or body)
        except Exception as exc:  # noqa: BLE001 — thử nhà cung cấp kế tiếp
            last_error = exc
            _disabled_until[name] = time.monotonic() + COOLDOWN_SECONDS
            logger.warning("Dịch bằng %s lỗi: %s (tạm bỏ qua %ss)", name, type(exc).__name__, COOLDOWN_SECONDS)
    raise TranslationError(str(last_error) if last_error else 'no provider')


def translate_text(text: str, source: str = 'vi', target: str = 'en') -> str:
    """Dịch một chuỗi (có thể là Markdown nhiều dòng). Chuỗi rỗng trả về rỗng."""
    if not text or not text.strip():
        return ''
    providers = [p.strip() for p in os.getenv('TRANSLATE_PROVIDERS', 'google,mymemory').split(',') if p.strip() in PROVIDERS]
    protected, saved = _protect(text)
    out_lines = []
    for line in protected.split('\n'):  # giữ nguyên cấu trúc dòng; dòng dài dịch theo mảnh rồi nối lại bằng dấu cách
        out_lines.append(' '.join(_translate_line(part, source, target, providers) for part in _split_long(line)))
    result = _restore('\n'.join(out_lines), saved)
    # Dịch vụ hay chèn dấu cách sau ** mở đầu chữ đậm ("** Chữ**") -> bỏ để Markdown vẫn đúng
    return re.sub(r'\*\*[ \t]+(?=[^*\n]+\*\*)', '**', result)
