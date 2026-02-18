#!/usr/bin/env python3
"""Pre-warm the cache for all popular songs × all severity levels.

Usage:
    cd backend
    python warm_cache.py

This fetches lyrics and generates roasts for every popular song at every
severity level (12 songs × 3 = 36 roasts). Each roast takes ~30s, so
the full warm takes ~18 minutes. Progress is printed as it goes.
"""

import time
from dotenv import load_dotenv

load_dotenv()

from popular_songs import POPULAR_SONGS
from lyrics_fetcher import fetch_lyrics
from roast_engine import generate_roast
import cache

SEVERITIES = ["mild", "medium", "savage"]


def main():
    total = len(POPULAR_SONGS) * len(SEVERITIES)
    done = 0

    for song in POPULAR_SONGS:
        artist = song["artist"]
        title = song["title"]

        # Resolve lyrics (cached or fetch)
        lyrics = cache.get_lyrics(artist, title)
        if not lyrics:
            print(f"  Fetching lyrics: {artist} - {title}...")
            lyrics = fetch_lyrics(artist, title)
            if not lyrics:
                print(f"  SKIP (no lyrics found): {artist} - {title}")
                done += len(SEVERITIES)
                continue
            cache.set_lyrics(artist, title, lyrics)
        else:
            print(f"  Lyrics cached: {artist} - {title}")

        for severity in SEVERITIES:
            done += 1
            existing = cache.get_roast(artist, title, severity)
            if existing:
                print(f"  [{done}/{total}] CACHED: {artist} - {title} ({severity})")
                continue

            print(f"  [{done}/{total}] Generating: {artist} - {title} ({severity})...", end=" ", flush=True)
            t = time.time()
            try:
                result = generate_roast(artist, title, lyrics, severity)
                result["artist"] = artist
                result["title"] = title
                result["severity"] = severity
                cache.set_roast(artist, title, severity, result)
                print(f"done ({time.time() - t:.1f}s)")
            except Exception as e:
                print(f"FAILED: {e}")

    print(f"\nCache warm complete. {done}/{total} processed.")


if __name__ == "__main__":
    main()
