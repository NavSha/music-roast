import requests

LYRICS_BASE = "https://api.lyrics.ovh/v1"
SUGGEST_BASE = "https://api.lyrics.ovh/suggest"


def search_songs(query):
    """Search for songs via lyrics.ovh suggest API."""
    try:
        resp = requests.get(f"{SUGGEST_BASE}/{query}", timeout=10)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("data", [])[:10]:
            results.append({
                "artist": item.get("artist", {}).get("name", ""),
                "title": item.get("title", ""),
                "cover": item.get("album", {}).get("cover_medium", ""),
            })
        return results
    except requests.RequestException as e:
        raise RuntimeError(f"Search failed: {e}")


def fetch_lyrics(artist, title):
    """Fetch lyrics for a specific song."""
    try:
        resp = requests.get(f"{LYRICS_BASE}/{artist}/{title}", timeout=15)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()
        return data.get("lyrics", "")
    except requests.RequestException as e:
        raise RuntimeError(f"Lyrics fetch failed: {e}")
