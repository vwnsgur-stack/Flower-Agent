import base64
import json
from ai_service import analyze_flower_image

try:
    with open("uploads/1d7624c61ef0465a84bd3e47ac14cab3.jpg", "rb") as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
    data_url = f"data:image/jpeg;base64,{b64}"
    result = analyze_flower_image(data_url)
    print("SUCCESS:", json.dumps(result, ensure_ascii=False))
except Exception as e:
    print("ERROR:", str(e))
