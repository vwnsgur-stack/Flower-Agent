import urllib.request
import urllib.parse
import json
import base64

try:
    with open("uploads/1d7624c61ef0465a84bd3e47ac14cab3.jpg", "rb") as f:
        file_bytes = f.read()

    # Create a multipart/form-data request manually
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"file\"; filename=\"test.jpg\"\r\n"
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode('utf-8') + file_bytes + f"\r\n--{boundary}--\r\n".encode('utf-8')

    req = urllib.request.Request("http://127.0.0.1:8000/analyze-image/")
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    req.data = body

    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Error body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
