# Song Roast - AI Lyrics Critic

Pick a song, and AI will roast its lyrics with devastating (but hilarious) precision.

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=your-key-here" > .env
python3 app.py
```

Backend runs on http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## How It Works

1. Pick a song from the popular grid, search for one, or paste lyrics manually
2. Choose a roast severity: Mild, Medium, or Savage
3. AI generates a structured roast with score, cliche counter, lyrical crime highlights, and more
4. Re-roast at different severity levels or try another song

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Python + Flask
- **AI**: Claude API (Sonnet 4.5)
- **Lyrics**: lyrics.ovh API
