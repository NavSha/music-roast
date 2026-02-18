export default function SongCard({ song, onClick }) {
  return (
    <button
      onClick={() => onClick(song)}
      className="group relative bg-surface rounded-xl border border-white/5 overflow-hidden
                 hover:border-fire-500/40 hover:shadow-lg hover:shadow-fire-500/10
                 transition-all duration-200 text-left w-full"
    >
      <div className="aspect-square bg-surface-light overflow-hidden">
        <img
          src={song.cover}
          alt={`${song.title} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl text-text-secondary">&#127925;</div>`;
          }}
        />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate group-hover:text-fire-400 transition-colors">
          {song.title}
        </p>
        <p className="text-xs text-text-secondary truncate mt-0.5">
          {song.artist}
        </p>
      </div>
      <div className="absolute inset-0 bg-fire-500/0 group-hover:bg-fire-500/5 transition-colors rounded-xl pointer-events-none" />
    </button>
  );
}
