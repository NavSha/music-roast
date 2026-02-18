import json
import os
import time
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv

from lyrics_fetcher import search_songs, fetch_lyrics
from roast_engine import generate_roast, generate_roast_stream
from popular_songs import POPULAR_SONGS
import cache

load_dotenv()

app = Flask(__name__)
CORS(app)


def _resolve_lyrics(artist, title):
    """Return lyrics from cache or fetch. Returns (lyrics, error_response) tuple."""
    # Check lyrics cache first
    cached = cache.get_lyrics(artist, title)
    if cached:
        app.logger.info(f"[CACHE] Lyrics cache hit: {artist} - {title}")
        return cached, None

    try:
        t = time.time()
        lyrics = fetch_lyrics(artist, title)
        app.logger.warning(f"[TIMING] Lyrics fetch: {time.time() - t:.2f}s")
    except RuntimeError as e:
        return None, (jsonify({"error": str(e)}), 502)

    if not lyrics:
        return None, (jsonify({"error": f"Could not find lyrics for '{title}' by {artist}."}), 404)

    cache.set_lyrics(artist, title, lyrics)
    return lyrics, None


@app.route("/api/health")
def health():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    return jsonify({
        "status": "ok",
        "api_key_configured": bool(key and key != "your-key-here"),
    })


@app.route("/api/popular")
def popular():
    return jsonify(POPULAR_SONGS)


@app.route("/api/search")
def search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Missing query parameter 'q'"}), 400
    try:
        results = search_songs(query)
        return jsonify(results)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/roast", methods=["POST"])
def roast():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    artist = data.get("artist", "").strip()
    title = data.get("title", "").strip()
    severity = data.get("severity", "medium").strip().lower()
    lyrics = data.get("lyrics", "").strip()

    if not artist and not lyrics:
        return jsonify({"error": "Either artist+title or lyrics required"}), 400

    if severity not in ("mild", "medium", "savage"):
        severity = "medium"

    effective_artist = artist or "Unknown"
    effective_title = title or "Unknown"

    # Check roast cache (only for non-custom-lyrics requests)
    if not lyrics:
        cached_roast = cache.get_roast(effective_artist, effective_title, severity)
        if cached_roast:
            app.logger.info(f"[CACHE] Roast cache hit: {effective_artist} - {effective_title} ({severity})")
            return jsonify(cached_roast)

    t_start = time.time()

    # Fetch lyrics if not provided
    if not lyrics:
        if not title:
            return jsonify({"error": "Title required when lyrics not provided"}), 400
        lyrics, err = _resolve_lyrics(artist, title)
        if err:
            return err

    # Generate roast
    try:
        t_roast = time.time()
        result = generate_roast(effective_artist, effective_title, lyrics, severity)
        app.logger.warning(f"[TIMING] Claude API roast: {time.time() - t_roast:.2f}s")
        app.logger.warning(f"[TIMING] Total request: {time.time() - t_start:.2f}s")
        result["artist"] = effective_artist
        result["title"] = effective_title
        result["severity"] = severity
        # Cache the result (only for non-custom-lyrics)
        if not data.get("lyrics", "").strip():
            cache.set_roast(effective_artist, effective_title, severity, result)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Roast generation failed: {e}"}), 500


@app.route("/api/roast/stream", methods=["POST"])
def roast_stream():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    artist = data.get("artist", "").strip()
    title = data.get("title", "").strip()
    severity = data.get("severity", "medium").strip().lower()
    lyrics = data.get("lyrics", "").strip()

    if not artist and not lyrics:
        return jsonify({"error": "Either artist+title or lyrics required"}), 400

    if severity not in ("mild", "medium", "savage"):
        severity = "medium"

    effective_artist = artist or "Unknown"
    effective_title = title or "Unknown"

    # Check roast cache (only for non-custom-lyrics requests)
    if not lyrics:
        cached_roast = cache.get_roast(effective_artist, effective_title, severity)
        if cached_roast:
            app.logger.info(f"[CACHE] Stream cache hit: {effective_artist} - {effective_title} ({severity})")

            def cached_stream():
                yield f"event: done\ndata: {json.dumps(cached_roast)}\n\n"

            return Response(
                cached_stream(),
                mimetype="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )

    # Fetch lyrics before streaming (errors return normal JSON)
    if not lyrics:
        if not title:
            return jsonify({"error": "Title required when lyrics not provided"}), 400
        lyrics, err = _resolve_lyrics(artist, title)
        if err:
            return err

    def stream_and_cache():
        """Wrap the stream generator to cache the result when done."""
        for event in generate_roast_stream(effective_artist, effective_title, lyrics, severity):
            # Intercept the done event to cache the result
            if event.startswith("event: done\n") and not data.get("lyrics", "").strip():
                data_line = event.split("data: ", 1)[1].strip()
                try:
                    result = json.loads(data_line)
                    cache.set_roast(effective_artist, effective_title, severity, result)
                except (json.JSONDecodeError, IndexError):
                    pass
            yield event

    return Response(
        stream_and_cache(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
