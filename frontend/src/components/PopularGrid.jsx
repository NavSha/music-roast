import SongCard from "./SongCard";

export default function PopularGrid({ songs, onSelect }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-text-secondary">Popular Songs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song, i) => (
          <div key={`${song.artist}-${song.title}`} className={`animate-fade-in-up stagger-${Math.min(i + 1, 7)}`}>
            <SongCard song={song} onClick={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
}
