"""Báo cho Next.js làm mới cache landing ngay sau khi lưu (on-demand revalidation). Lỗi mạng bỏ qua — cache tự hết hạn sau 5 phút."""
import json
import logging
import os
import threading
import urllib.request

logger = logging.getLogger(__name__)


def trigger_revalidate(tag: str) -> None:
    url = os.getenv('NEXT_REVALIDATE_URL')  # vd https://ericss.dev/api/revalidate
    secret = os.getenv('REVALIDATE_SECRET')
    if not url or not secret:
        return

    def send():
        try:
            req = urllib.request.Request(
                url, data=json.dumps({'tag': tag}).encode(), method='POST',
                headers={'Content-Type': 'application/json', 'x-revalidate-secret': secret},
            )
            urllib.request.urlopen(req, timeout=5).close()
        except Exception as exc:  # noqa: BLE001
            logger.warning('Không gọi được revalidate (%s): %s', tag, exc)

    threading.Thread(target=send, daemon=True).start()
