import { useEffect } from "react";

export default function ErrorDisplay({ message, onDismiss }) {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="max-w-2xl mx-auto mb-6 px-4 animate-fade-in-up">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">&#9888;&#65039;</span>
        <div className="flex-1">
          <p className="text-red-300 text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400/60 hover:text-red-400 transition-colors text-lg leading-none"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
