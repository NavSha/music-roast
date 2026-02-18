import { SEVERITY_LEVELS } from "../constants";

export default function ActionBar({ currentSeverity, onReRoast, onReset, delay = 700 }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      {SEVERITY_LEVELS.filter((l) => l.id !== currentSeverity).map((level) => (
        <button
          key={level.id}
          onClick={() => onReRoast(level.id)}
          className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all
                     ${level.bg} ${level.border} ${level.color} hover:scale-105`}
        >
          Re-roast at {level.emoji} {level.label}
        </button>
      ))}
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-full border border-white/10 text-sm font-semibold
                   text-text-secondary hover:text-text-primary hover:border-white/20 transition-all"
      >
        Roast Another Song
      </button>
    </div>
  );
}
