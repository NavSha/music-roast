import hashlib
import json
import os

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")


def _key_hash(*parts):
    """Create a stable hash from key parts."""
    raw = "|".join(str(p).strip().lower() for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _cache_path(namespace, *key_parts):
    directory = os.path.join(CACHE_DIR, namespace)
    os.makedirs(directory, exist_ok=True)
    return os.path.join(directory, f"{_key_hash(*key_parts)}.json")


def get_lyrics(artist, title):
    """Return cached lyrics string, or None if not cached."""
    path = _cache_path("lyrics", artist, title)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f).get("lyrics")
    return None


def set_lyrics(artist, title, lyrics):
    """Cache lyrics for a song."""
    path = _cache_path("lyrics", artist, title)
    with open(path, "w") as f:
        json.dump({"artist": artist, "title": title, "lyrics": lyrics}, f)


def get_roast(artist, title, severity):
    """Return cached roast dict, or None if not cached."""
    path = _cache_path("roasts", artist, title, severity)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return None


def set_roast(artist, title, severity, data):
    """Cache a roast result."""
    path = _cache_path("roasts", artist, title, severity)
    with open(path, "w") as f:
        json.dump(data, f)
