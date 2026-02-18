import { useMemo } from "react";

function extractRoastText(raw) {
  // Look for "the_roast": " in the accumulated JSON stream
  const key = '"the_roast"';
  const keyIdx = raw.indexOf(key);
  if (keyIdx === -1) return null;

  // Find the opening quote of the value
  const afterKey = raw.slice(keyIdx + key.length);
  const colonIdx = afterKey.indexOf(":");
  if (colonIdx === -1) return null;

  const afterColon = afterKey.slice(colonIdx + 1).trimStart();
  if (!afterColon.startsWith('"')) return null;

  // Extract string content, handling escaped characters
  let result = "";
  let i = 1; // skip opening quote
  while (i < afterColon.length) {
    const ch = afterColon[i];
    if (ch === "\\") {
      const next = afterColon[i + 1];
      if (next === "n") result += "\n";
      else if (next === '"') result += '"';
      else if (next === "\\") result += "\\";
      else if (next === "t") result += "\t";
      else result += next || "";
      i += 2;
    } else if (ch === '"') {
      break; // end of string value
    } else {
      result += ch;
      i++;
    }
  }

  return result || null;
}

export default function StreamingView({ streamingText, song, onAbort }) {
  const roastText = useMemo(() => extractRoastText(streamingText), [streamingText]);
  const isWaiting = roastText === null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative mb-6">
        <div className="text-6xl animate-bounce-in">&#128293;</div>
        <div className="absolute inset-0 text-6xl animate-spin-slow opacity-20">&#128293;</div>
      </div>

      {song && (
        <p className="text-xl font-bold mb-1 animate-fade-in-up">
          Roasting "{song.title}"
        </p>
      )}
      {song?.artist && (
        <p className="text-text-secondary mb-6 animate-fade-in-up stagger-1">
          by {song.artist}
        </p>
      )}

      {isWaiting ? (
        <p className="text-fire-400 font-medium text-lg animate-fade-in-up stagger-2">
          Warming up the roast pit...
        </p>
      ) : (
        <div className="max-w-2xl w-full animate-fade-in-up">
          <div className="bg-surface rounded-xl p-6 border border-white/5">
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {roastText}
              <span className="typewriter-cursor" />
            </p>
          </div>
        </div>
      )}

      {onAbort && (
        <button
          onClick={onAbort}
          className="mt-6 px-4 py-2 text-sm text-text-secondary hover:text-text-primary
                     border border-white/10 hover:border-white/20 rounded-full transition-all
                     animate-fade-in-up stagger-3"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
