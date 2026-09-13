import { useEffect, useState } from 'react';
import FixtureCard from './components/FixtureCard.jsx';

const API_BASE = 'https://cloudsport.onrender.com';

export default function App() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    loadFixtures();
  }, []);

  async function loadFixtures() {
    try {
      const res = await fetch(API_BASE + '/api/fixtures');
      const data = await res.json();
      const list = data.fixtures || [];
      setFixtures(list);
      setLoading(false);
      list.slice(0, 6).forEach(function (fixture) {
        loadPrediction(fixture);
      });
    } catch (err) {
      setError('Could not load fixtures');
      setLoading(false);
    }
  }

  async function loadPrediction(fixture) {
    try {
      const res = await fetch(API_BASE + '/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixture: fixture })
      });
      const data = await res.json();
      setPredictions(function (prev) {
        const next = Object.assign({}, prev);
        next[fixture.fixtureId] = data.prediction;
        return next;
      });
    } catch (err) {
      // silently skip a failed prediction; the card just won't render for it
    }
  }

  return (
    <div className="min-h-screen bg-overcast p-6">
      <h1 className="font-display text-3xl text-ink mb-6">CloudSport</h1>

      {loading && <p className="font-body text-ink/60">Loading fixtures...</p>}
      {error && <p className="font-body text-storm">{error}</p>}

      <div className="grid gap-4">
        {fixtures.slice(0, 6).map(function (fixture) {
          const prediction = predictions[fixture.fixtureId];
          if (!prediction) {
            return (
              <div key={fixture.fixtureId} className="bg-surface rounded-card border border-ink/10 p-4 max-w-md">
                <p className="font-body text-ink/50 text-sm">
                  {fixture.homeTeam.name} vs {fixture.awayTeam.name} — analyzing...
                </p>
              </div>
            );
          }
          return <FixtureCard key={fixture.fixtureId} fixture={fixture} prediction={prediction} />;
        })}
      </div>
    </div>
  );
}