#!/usr/bin/env python3
"""
Server tĩnh cho game — có bật nén gzip, đúng MIME cho .glb và cho phép mở từ
điện thoại trong cùng mạng Wi-Fi.

Dùng:   python3 serve.py            # cổng 8080
        python3 serve.py 5173       # cổng khác
"""
import gzip
import io
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

COMPRESSIBLE = ('.html', '.js', '.css', '.json', '.svg', '.map')


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.glb': 'model/gltf-binary',
        '.gltf': 'model/gltf+json',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
    }

    def end_headers(self):
        # Model không đổi thì cho cache lâu, mã nguồn thì luôn kiểm tra lại
        path = self.path.split('?')[0]
        if path.endswith(('.glb', '.gltf', '.png', '.jpg', '.woff2')):
            self.send_header('Cache-Control', 'public, max-age=604800')
        else:
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        wants_gzip = 'gzip' in self.headers.get('Accept-Encoding', '')

        if not (wants_gzip and path.endswith(COMPRESSIBLE)):
            return super().send_head()

        try:
            with open(path, 'rb') as f:
                raw = f.read()
        except OSError:
            return super().send_head()

        buf = io.BytesIO()
        with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as gz:
            gz.write(raw)
        data = buf.getvalue()

        self.send_response(200)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        return io.BytesIO(data)

    def log_message(self, fmt, *args):
        pass  # bớt log cho đỡ rối


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f'  Máy này : http://localhost:{port}/index.html')
    print(f'  Điện thoại (cùng Wi-Fi) : http://{lan_ip()}:{port}/index.html')
    print('  Ctrl+C để dừng\n')
    ThreadingHTTPServer(('0.0.0.0', port), Handler).serve_forever()
