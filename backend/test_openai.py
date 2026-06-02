import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', 'your-api-key-here'))

try:
    response = client.chat.completions.create(model='gpt-4o', messages=[{'role': 'user', 'content': 'hello'}])
    print('SUCCESS:', response.choices[0].message.content)
except Exception as e:
    print(f'ERROR: {type(e).__name__} - {e}')
