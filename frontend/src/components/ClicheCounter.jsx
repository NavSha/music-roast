import { useState } from "react";

export default function ClicheCounter({ cliches }) {
  const [expanded, setExpanded] = useState(null);

  if (!cliches?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {cliches.map((item, i) => {
        const isOpen = expanded === i;
        return (
          <button
            key={i}
            onClick={() => setExpanded(isOpen ? null : i)}
            className={`relative bg-fire-500/10 border border-fire-500/20 rounded-full
                       px-4 py-1.5 text-sm transition-colors text-left
                       ${isOpen ? "bg-fire-500/20 ring-1 ring-fire-500/40" : "hover:bg-fire-500/20"}`}
          >
            <span className="text-fire-400 font-medium">{item.cliche}</span>
            {isOpen && (
              <span className="block text-xs text-text-secondary mt-1 pb-0.5">
                {item.quip}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
