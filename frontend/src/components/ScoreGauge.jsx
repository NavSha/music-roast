import { SCORE_LABELS } from "../constants";

export default function ScoreGauge({ score, comment, delay = 0 }) {
  const getColor = () => {
    if (score <= 3) return { text: "text-red-500", stroke: "#ef4444" };
    if (score <= 5) return { text: "text-fire-500", stroke: "#f97316" };
    if (score <= 7) return { text: "text-yellow-400", stroke: "#facc15" };
    return { text: "text-green-400", stroke: "#4ade80" };
  };

  const { text, stroke } = getColor();

  // SVG arc: 180-degree gauge (semicircle)
  const radius = 80;
  const cx = 100;
  const cy = 95;
  const circumference = Math.PI * radius;
  const progress = score / 10;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="animate-bounce-in text-center py-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative inline-block">
        <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${stroke}40)` }}
          />
        </svg>
        {/* Score number centered in arc */}
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div>
            <span className={`text-6xl font-black ${text}`}>{score}</span>
            <span className="text-2xl text-text-secondary">/10</span>
          </div>
        </div>
      </div>
      <p className="text-xl font-bold mt-1 text-text-primary">
        {SCORE_LABELS[score] || "Unrated"}
      </p>
      {comment && (
        <p className="text-text-secondary mt-1 italic">"{comment}"</p>
      )}
    </div>
  );
}
