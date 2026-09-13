// dataProvider.js
// Wraps API-Football calls. Phase 1 scope: fixtures + basic stats for one league.
// Uses a direct API-Sports account (dashboard.api-football.com), not RapidAPI —
// auth header is x-apisports-key and the base URL is v3.football.api-sports.io.
//
// NOTE: the free API-Sports plan only covers certain past seasons, not the
// current in-progress one — so Phase 1 defaults to season 2023 (confirmed
// working) as a stand-in for "live" data. This gets revisited once on a paid
// plan or once live/current-season access is confirmed.

const BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

// Premier League = league id 39 in API-Football
const DEFAULT_LEAGUE_ID = 39;
const DEFAULT_SEASON = 2023;

async function apiFootballGet(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

// Get fixtures for a league/season (Phase 1: treated as "upcoming" for demo purposes).
export async function getUpcomingFixtures({ leagueId = DEFAULT_LEAGUE_ID, season = DEFAULT_SEASON, limit = 20 } = {}) {
  const fixtures = await apiFootballGet('/fixtures', {
    league: leagueId,
    season,
  });

  return fixtures.slice(0, limit).map(normalizeFixture);
}

// Get recent form + head-to-head for two teams ahead of a fixture.
export async function getMatchContext({ homeTeamId, awayTeamId, leagueId = DEFAULT_LEAGUE_ID, season = DEFAULT_SEASON }) {
  const [