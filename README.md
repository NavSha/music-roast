# Song Roast - AI Lyrics Critic

Pick a song, and AI will roast its lyrics with devastating (but hilarious) precision. Features real-time streaming so you can watch the roast unfold, plus 24 popular songs pre-cached for instant results.

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file with your Anthropic API key:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

Start the server:

```bash
python3 app.py
```

Backend runs on http://localhost:5001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 3. Open the app

Visit http://localhost:5173 in your browser. Both servers need to be running.

## Pre-warming the Cache (Optional)

The repo ships with 72 pre-cached roasts (24 songs x 3 severities). If you want to regenerate them or the cache is cleared:

```bash
cd backend
source venv/bin/activate
python warm_cache.py
```

This takes ~30-40 minutes (each roast is a Claude API call). Cached songs load instantly; uncached songs generate live and get cached on first use.

## How It Works

1. Pick a song from the popular grid or search for any song
2. Choose a roast severity: Mild, Medium, or Savage
3. Watch the roast stream in real-time with a typewriter effect
4. View the full structured report: score gauge, cliche counter, lyrical crime highlights, hidden meanings, and final verdict
5. Re-roast at a different severity or try another song

## Project Structure

```
backend/
  app.py              # Flask API (endpoints for search, roast, stream)
  roast_engine.py     # Claude API integration (standard + streaming)
  lyrics_fetcher.py   # Lyrics lookup via lyrics.ovh
  popular_songs.py    # 24 curated popular songs with album art
  cache.py            # File-based JSON cache (lyrics + roasts)
  warm_cache.py       # Script to pre-generate roasts for popular songs
  cache/              # Cached lyrics and roast JSON files

frontend/
  src/
    App.jsx           # Main app with view state routing
    api.js            # API client (fetch, search, stream with SSE)
    hooks/useRoast.js # State machine: pick -> streaming -> report
    components/
      StreamingView   # Real-time typewriter roast display
      RoastReport     # Full structured report with staggered animations
      ScoreGauge      # Radial arc score visualization
      ClicheCounter   # Tap-to-expand cliche pills
      SongPicker      # Search + popular grid
      ...
```

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Python + Flask
- **AI**: Claude API (Sonnet 4.5) with SSE streaming
- **Lyrics**: lyrics.ovh API
- **Caching**: File-based JSON (no external dependencies)
