import ScoreGauge from "./ScoreGauge";
import ReportSection from "./ReportSection";
import ClicheCounter from "./ClicheCounter";
import ActionBar from "./ActionBar";

export default function RoastReport({ data, onReRoast, onReset }) {
  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Song title — instant, no Y shift */}
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-black">
          "{data.title}" <span className="text-text-secondary font-normal">by</span> {data.artist}
        </h2>
        <p className="text-text-secondary mt-1 capitalize">
          {data.severity} roast
        </p>
      </div>

      {/* Score — bounce-in with short delay */}
      <ScoreGauge score={data.overall_score} comment={data.overall_score_comment} delay={250} />

      {/* Report sections — cascade with meaningful gaps */}
      <div className="space-y-5 mt-8">
        <ReportSection title="The Roast" icon="&#128293;" delay={500}>
          <div className="text-text-secondary leading-relaxed whitespace-pre-line">
            {data.the_roast}
          </div>
        </ReportSection>

        <ReportSection title="Cliche Counter" icon="&#128240;" delay={900}>
          <ClicheCounter cliches={data.cliche_counter} />
        </ReportSection>

        <ReportSection title="Lyrical Crime Highlights" icon="&#128680;" delay={1300}>
          <div className="space-y-4">
            {data.lyrical_crime_highlights?.map((item, i) => (
              <div key={i} className="bg-bg rounded-lg p-4 border border-white/5">
                <div className="border-l-2 border-fire-500/60 pl-3 mb-3">
                  <p className="text-fire-300 font-mono text-sm italic">"{item.line}"</p>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                  <span className="text-red-400 font-semibold">Crime:</span>
                  <span className="text-text-primary">{item.crime}</span>
                  <span className="text-yellow-400 font-semibold">Sentence:</span>
                  <span className="text-text-primary">{item.sentence}</span>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="Hidden Meanings" icon="&#128373;&#65039;" delay={1700}>
          <p className="text-text-secondary leading-relaxed italic">
            {data.hidden_meanings}
          </p>
        </ReportSection>

        <ReportSection title="Final Verdict" icon="&#9878;&#65039;" delay={2100}>
          <p className="text-xl font-bold text-fire-400 leading-relaxed">
            {data.final_verdict}
          </p>
        </ReportSection>
      </div>

      {/* Actions */}
      <ActionBar
        currentSeverity={data.severity}
        onReRoast={onReRoast}
        onReset={onReset}
        delay={2500}
      />
    </div>
  );
}
