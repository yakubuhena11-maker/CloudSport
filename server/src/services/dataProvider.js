// dataProvider.js
// Wraps API-Football calls. Phase 1 scope: fixtures + basic stats for one league.
// Uses a direct API-Sports account (dashboard.api-football.com), not RapidAPI —
// auth header is x-apisports-key and the base URL is v3.football.api-sports.io.

const BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

// Premier League = league id 39 in API-Football
const DEFAULT_LEAGUE_ID = 39;

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

// Get upcoming fixtures for a league within the next N days.
export async function getUpcomingFixtures({ leagueId = DEFAULT_LEAGUE_ID, season, days = 7 } = {}) {
  const currentSeason = season || new Date().getFullYear();
  const fixtures = await apiFootballGet('/fixtures', {
    league: leagueId,
    season: currentSeason,
    next: 20, // next 20 fixtures; filter by date window on our side if needed
  });

  return fixtures.map(normalizeFixture);
}

// Get recent form + head-to-head for two teams ahead of a fixture.
export async function getMatchContext({ homeTeamId, awayTeamId, leagueId = DEFAULT_LEAGUE_ID, season }) {
  const currentSeason = season || new Date().getFullYear();

  const [homeForm, awayForm, headToHead] = await Promise.all([
    apiFootballGet('/teams/statistics', { team: homeTeamId, league: leagueId, season: currentSeason }),
    apiFootballGet('/teams/statistics', { team: awayTeamId, league: leagueId, season: currentSeason }),
    apiFootballGet('/fixtures/headtohead', { h2h: `${homeTeamId}-${awayTeamId}`, last: 5 }),
  ]);

  return {
    homeForm: summarizeTeamStats(homeForm),
    awayForm: summarizeTeamStats(awayForm),
    headToHead: (headToHead || []).map(normalizeFixture),
  };
}

function normalizeFixture(raw) {
  return {
    fixtureId: raw.fixture.id,
    date: raw.fixture.date,
    status: raw.fixture.status.short,
    venue: raw.fixture.venue?.name,
    league: raw.league.name,
    homeTeam: { id: raw.teams.home.id, name: raw.teams.home.name },
    awayTeam: { id: raw.teams.away.id, name: raw.teams.away.name },
    goals: raw.goals,
  };
}

function summarizeTeamStats(raw) {
  if (!raw) return null;
  return {
    played: raw.fixtures?.played?.total,
    wins: raw.fixtures?.wins?.total,
    draws: raw.fixtures?.draws?.total,
    losses: raw.fixtures?.loses?.total,
    goalsForAvg: raw.goals?.for?.average?.total,
    goalsAgainstAvg: raw.goals?.against?.average?.total,
    form: raw.form, // e.g. "WWDLW"
  };
}