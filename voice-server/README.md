ANNA AI V5 COMPLETE

Included features:
- Chinese Practice mode
- Myanmar to Chinese Sentence Builder mode
- Hanzi
- Pinyin
- Speaker
- Large microphone icon
- Conversation memory in Practice mode
- Exactly one follow-up question in Practice mode
- No Myanmar translation in the reply area
- Text input for Sentence Builder
- Voice recording only in Practice mode
- Backend and frontend request timeouts
- LANGUAGE export included
- Full replacement files

BACKEND FILES

Copy these files:
voice-server/main.py
voice-server/services/__init__.py
voice-server/services/llm.py
voice-server/services/stt.py
voice-server/requirements.txt

To:
C:\Users\HMT\anna-ai\voice-server\

Run:

cd C:\Users\HMT\anna-ai\voice-server
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Check Ollama:

ollama list

If qwen3:1.7b is missing:

ollama pull qwen3:1.7b

Stop old port 8000 process if necessary:

netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

Start backend:

python -m uvicorn main:app --host 127.0.0.1 --port 8000

FRONTEND FILES

Copy:
frontend/types/ai.ts
frontend/lib/ai/constants.ts
frontend/lib/ai/api.ts
frontend/lib/ai/speech.ts
frontend/components/ai/ChatWindow.tsx

To the matching paths inside:
C:\Users\HMT\anna-ai\

Ensure .env.local contains:

NEXT_PUBLIC_VOICE_SERVER_URL=http://127.0.0.1:8000

Restart frontend:

cd C:\Users\HMT\anna-ai
npm run dev

Open:

http://localhost:3000/dashboard/ai

MODE 1: CHINESE PRACTICE
- Speak Chinese
- Anna replies naturally
- Anna asks exactly one follow-up question
- Conversation history is retained

MODE 2: SENTENCE BUILDER
- Type Myanmar
- Receive Chinese Hanzi and Pinyin
- No follow-up question
- No conversation memory
