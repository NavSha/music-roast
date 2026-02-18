const API_BASE = "/api";

export async function checkHealth() {
  const resp = await fetch(`${API_BASE}/health`);
  return resp.json();
}

export async function searchSongs(query) {
  const resp = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Search failed" }));
    throw new Error(err.error || "Search failed");
  }
  return resp.json();
}

export async function fetchPopularSongs() {
  const resp = await fetch(`${API_BASE}/popular`);
  return resp.json();
}

export async function submitRoast({ artist, title, severity, lyrics }) {
  const resp = await fetch(`${API_BASE}/roast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist, title, severity, lyrics }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Roast failed" }));
    throw new Error(err.error || "Roast failed");
  }
  return resp.json();
}

export async function streamRoast({ artist, title, severity, lyrics, onToken, onDone, onError, signal }) {
  const resp = await fetch(`${API_BASE}/roast/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist, title, severity, lyrics }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Roast failed" }));
    throw new Error(err.error || "Roast failed");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line in buffer

    let eventType = null;
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7);
      } else if (line.startsWith("data: ") && eventType) {
        const data = JSON.parse(line.slice(6));
        if (eventType === "token") {
          onToken?.(data);
        } else if (eventType === "done") {
          onDone?.(data);
        } else if (eventType === "error") {
          onError?.(data);
        }
        eventType = null;
      }
    }
  }
}
