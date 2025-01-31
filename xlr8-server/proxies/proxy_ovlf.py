from flask import Flask, request, Response, session
import requests
import brotli
import re
import gzip
import zlib

app = Flask(__name__)
import os
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_key_for_dev_only")

TARGET_URL = "https://overleaf.com"  # Replace with your target site

user_sessions = {}

@app.route('/proxy', methods=["GET", "POST"])
def proxy():
    data = request.get_json()

    path = request.full_path.replace("/proxy", "", 1)
    url = TARGET_URL + path
    print(f'Proxy fetching: {url}')

    user_cookies = session.get("cookies", {})

    user_id = data.get('user_id')
    if user_id not in user_sessions:
        user_sessions[user_id] = requests.Session()

    user_session = user_sessions[user_id]

    headers = {
        "User-Agent": request.headers.get("User-Agent"),
        "Referer": request.headers.get("Referer", TARGET_URL),
        "Accept-Encoding": "gzip, br, deflate"  # Allow compression to be used
    }

    if request.method == "POST":
        resp = requests.post(url, headers=headers, data=request.form, allow_redirects=True)
    else:
        resp = requests.get(url, headers=headers, allow_redirects=True)

    # # Store user cookies for session tracking
    # session["cookies"] = requests.utils.dict_from_cookiejar(resp.cookies)

    # # Handle Encoding
    # encoding = resp.headers.get("Content-Encoding", "").lower()
    # content = resp.content  # Keep as bytes initially
    # content_type = resp.headers.get("Content-Type", "")

    # if encoding == "gzip":
    #     if content[:2] == b'\x1f\x8b':  # Check gzip magic number
    #         content = gzip.decompress(content)
    #     else:
    #         print("WARNING: Skipping gzip decompression (not a valid gzip file)")
    # elif encoding == "br":
    #     if content[:2] != b'<!':  # Avoid decompressing HTML by mistake
    #         content = brotli.decompress(content)
    #     else:
    #         print("WARNING: Skipping Brotli decompression (not a valid Brotli file)")
    # elif encoding == "deflate":
    #     try:
    #         content = zlib.decompress(content)
    #     except zlib.error:
    #         print("WARNING: Skipping deflate decompression (not a valid deflate file)")

    
    # # Modify HTML Responses
    # if "text/html" in content_type:
    #     content = content.decode("utf-8")

    #     # Rewrite static assets (images, scripts, CSS)
    #     content = re.sub(
    #         r'(<(img|script|link|video|source|iframe)[^>]+(?:src|href)=["\'])(/[^"\']+)',
    #         rf'\1{TARGET_URL}\3', content
    #     )

    #     content = content.encode("utf-8")

    # if request.path.startswith("/img/") or request.path.startswith("/js/") or request.path.startswith("/css/"):
    #     return requests.get(TARGET_URL + request.path).content

    # # Remove headers that interfere with rendering
    # excluded_headers = ["x-frame-options", "content-security-policy", "transfer-encoding", "content-encoding"]
    # modified_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded_headers}

    # # Ensure Content-Length is only set when needed
    # if "Content-Length" in modified_headers:
    #     modified_headers["Content-Length"] = str(len(content))

    return Response(resp.content, resp.status_code, resp.headers.items())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)