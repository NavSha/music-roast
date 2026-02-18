import { useState, useEffect } from "react";
import PopularGrid from "./PopularGrid";
import SearchBar from "./SearchBar";
import SeveritySelector from "./SeveritySelector";
import { fetchPopularSongs } from "../api";

export default function SongPicker({ severity, onSeverityChange, onSelectSong }) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchPopularSongs()
      .then(setSongs)
      .catch(() => setSongs([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <SeveritySelector value={severity} onChange={onSeverityChange} />

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-text-secondary">Search for any song</h2>
        <SearchBar onSelect={onSelectSong} />
      </div>

      {songs.length > 0 && (
        <div className="mb-8">
          <PopularGrid songs={songs} onSelect={onSelectSong} />
        </div>
      )}
    </div>
  );
}
