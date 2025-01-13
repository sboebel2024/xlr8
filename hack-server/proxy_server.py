from flask import Flask, request, Response, send_from_directory
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# Target website to proxy and inject
TARGET_URL = "https://www.desmos.com"  # Replace with the actual website

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def proxy(path):
    # Step 1: Fetch the original content
    target_url = f"{TARGET_URL}/{path}"
    resp = requests.get(target_url, params=request.args)
    
    # Ensure the request was successful
    if resp.status_code != 200:
        return Response(f"Failed to fetch {target_url}", status=resp.status_code)
    
    # Get the content type
    content_type = resp.headers.get("Content-Type", "")

    # Step 2: Inject JavaScript into HTML pages
    if "text/html" in content_type:
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Inject a <script> tag into the <head> or <body>
        script_tag = soup.new_tag("script", src="static/hook.js")
        if soup.head:
            soup.head.append(script_tag)
        elif soup.body:
            soup.body.append(script_tag)
                
        
        # Return the modified HTML
        modified_html = str(soup)
        return Response(modified_html, content_type=content_type)

    # Step 3: Serve non-HTML content (e.g., CSS, JS, images) as-is
    return Response(resp.content, content_type=content_type)

if __name__ == "__main__":
    app.run(port=8000, debug=True)
