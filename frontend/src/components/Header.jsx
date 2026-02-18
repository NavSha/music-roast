export default function Header({ compact = false, onGoHome }) {
  if (compact) {
    return (
      <header className="text-center py-4 px-4">
        <h1
          onClick={onGoHome}
          className="text-2xl font-black tracking-tight animate-pulse-fire cursor-pointer hover:opacity-80 transition-opacity"
        >
          &larr; Song Roast
        </h1>
      </header>
    );
  }

  return (
    <header className="text-center py-8 px-4">
      <h1 className="text-5xl md:text-6xl font-black tracking-tight animate-pulse-fire">
        Song Roast
      </h1>
      <p className="mt-3 text-lg text-text-secondary">
        Pick a song. We'll roast its lyrics. No feelings spared.
      </p>
    </header>
  );
}
