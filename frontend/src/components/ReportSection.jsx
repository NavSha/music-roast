export default function ReportSection({ title, icon, delay = 0, children }) {
  return (
    <div
      className="animate-fade-in-up bg-surface rounded-xl border border-white/5 p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
