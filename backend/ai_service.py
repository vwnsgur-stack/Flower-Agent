import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

# Initialize the OpenAI client
# Ensure the OPENAI_API_KEY environment variable is set
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key-here"))

def analyze_flower_image(image_url: str) -> dict:
    """
    Given an image URL, uses GPT-4o (Vision) to analyze the flowers 
    and returns a structured JSON response.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "너는 20년 경력의 수석 플로리스트이자 식물 학자야. 너의 가장 중요한 임무는 장미 계열의 꽃을 식별할 때 단순히 '장미'라고 뭉뚱그려 부르지 않는 거야. 반드시 화형(꽃잎 모양, 겹수)과 색상, 크기를 정밀하게 분석하여 '자나장미', '하젤장미', '맨스필드파크 장미', '빅토리아 장미', '마가렛', '오로라 장미', '염색 장미' 등 정확한 세부 품종명으로 식별해야 해. 다른 꽃들도 최대한 구체적인 품종명으로 명시해."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "첨부된 꽃다발 사진에 들어있는 모든 꽃의 종류와 포장재의 색상을 분석해줘. 반드시 JSON 형식으로 반환해야 하며, 'summary' 필드에는 다음 형식을 엄격히 지켜:\\n꽃종류 : 구체적인 품종명으로 식별된 모든 꽃 이름 나열 (예: 맨스필드파크 장미, 하젤장미, 카네이션 등)\\n포장 : 포장재의 구체적이고 정확한 색상 이름 (예: 화이트, 연핑크, 네이비 등. '톤' 금지)\\n\\n그리고 'flowers' 필드에는 ['꽃이름1', '꽃이름2'] 처럼 추출된 모든 구체적인 꽃 품종 이름만 배열 형태로 반환해줘."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            response_format={ "type": "json_object" },
            max_tokens=300
        )
        
        result_text = response.choices[0].message.content
        return json.loads(result_text)
    
    except Exception as e:
        import traceback
        with open("error.log", "a", encoding="utf-8") as f:
            f.write(f"Error: {str(e)}\n")
            f.write(traceback.format_exc() + "\n")
        print(f"Error calling OpenAI API: {e}")
        return {
            "summary": "분석 실패, 이미지를 다시 등록해주세요.",
            "flowers": None
        }
