import { SEVERITY_LEVELS } from "../constants";

export default function SeveritySelector({ value, onChange }) {
  return (
    <div className="flex justify-center gap-3 mb-8">
      {SEVERITY_LEVELS.map((level) => {
        const active = value === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`
              px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200
              ${active
                ? `${level.bg} ${level.border} ${level.color} scale-105 shadow-lg`
                : "bg-surface border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary"
              }
            `}
          >
            <span className="mr-1.5">{level.emoji}</span>
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
