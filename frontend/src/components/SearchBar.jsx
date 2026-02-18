import { useState, useEffect, useRef } from "react";
import { searchSongs } from "../api";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSongs(query);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (song) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect(song);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any song..."
          className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-text-primary
                     placeholder:text-text-secondary focus:outline-none focus:border-fire-500/50
                     focus:ring-1 focus:ring-fire-500/30 transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-fire-500/30 border-t-fire-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-full bg-surface border border-white/10 rounded-xl
                        shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {results.map((song, i) => (
            <button
              key={i}
              onClick={() => handleSelect(song)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-light
                         transition-colors text-left"
            >
              {song.cover ? (
                <img src={song.cover} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-surface-light flex items-center justify-center text-lg flex-shrink-0">
                  &#127925;
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{song.title}</p>
                <p className="text-xs text-text-secondary truncate">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
