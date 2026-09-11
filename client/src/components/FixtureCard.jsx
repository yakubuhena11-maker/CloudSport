// FixtureCard.jsx
// Demonstrates CloudSport's core visual pattern: confidence drawn as a
// gradient band, not just printed as a percentage. Use this as the
// reference component for any new prediction-display UI.

const confidenceColor = {
  high: 'bg-sunbreak',
  medium: 'bg-steel',
  low: 'bg-storm',
};

export default function FixtureCard({ fixture, prediction }) {
  const { homeTeam, awayTeam, date, league } = fixture;
  const { probabilities, confidence, prediction: pick, supporting_factors } = prediction;

  return (
    <div className="bg-surface rounded-card border border-ink/10 p-4 max-w-md">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-ink/60 font-body">{league}</span>
        <span className="text-sm text-ink/60 font-body">
          {new Date(date).toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <h3 className="font-display text-xl mb-3">
        {homeTeam.name} <span className="text-ink/40">vs</span> {awayTeam.name}
      </h3>

      {/* Confidence band: width maps to the leading probability */}
      <div className="w-full h-2 rounded-full bg-overcast overflow-hidden mb-2">
        <div
          className={`h-full ${confidenceColor[confidence]}`}
          style={{ width: `${Math.max(probabilities.home_win, probabilities.draw, probabilities.away_win)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm font-body text-ink/80 mb-3">
        <span>Home {probabilities.home_win}%</span>
        <span>Draw {probabilities.draw}%</span>
        <span>Away {probabilities.away_win}%</span>
      </div>

      <p className="text-sm font-body text-ink/70">
        Estimate: <strong className="text-ink">{pick.replace('_', ' ')}</strong> ({confidence} confidence)
      </p>

      <ul className="mt-2 text-sm text-ink/60 list-disc list-inside">
        {supporting_factors.map((factor, i) => (
          <li key={i}>{factor}</li>
        ))}
      </ul>
    </div>
  );
}