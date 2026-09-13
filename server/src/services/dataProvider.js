// dataProvider.js
// Wraps API-Football calls. Phase 1 scope: fixtures + basic stats for one league.
// Uses a direct API-Sports account (dashboard.api-football.com), not RapidAPI —
// auth header is x-apisports-key and the base URL is v3.football.api-sports.io.
//
// NOTE: the free API-Sports plan only covers certain past seasons, not the
// current in-progress one — so Phase 1 defaults to season 2023 (confirmed
// working) as a stand-in for "live" data.

const BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

const DEFAULT_LEAGUE_ID = 39;
const DEFAULT_SEASON = 2023;

async function apiFootballGet(path, params) {
  params = params || {};
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(function (entry) {
    url.searchParams.set(entry[0], entry[1]);
  });

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY }
  });

  if (!response.ok) {
    throw new Error('API-Football request failed: ' + response.status + ' ' + response.statusText);
  }

  const data = await response.json();
  return data.response;
}

export async function getUpcomingFixtures(options) {
  options = options || {};
  const leagueId = options.leagueId || DEFAULT_LEAGUE_ID;
  const season = options.season || DEFAULT_SEASON;
  const limit = options.limit || 20;

  const fixtures = await apiFootballGet('/fixtures', { league: leagueId, season: season });
  return fixtures.slice(0, limit).map(normalizeFixture);
}

export async function getMatchContext(options) {
  const homeTeamId = options.homeTeamId;
  const awayTeamId = options.awayTeamId;
  const leagueId = options.leagueId || DEFAULT_LEAGUE_ID;
  const season = options.season || DEFAULT_SEASON;

  const homeFormPromise = apiFootballGet('/teams/statistics', { team: homeTeamId, league: leagueId, season: season });
  const awayFormPromise = apiFootballGet('/teams/statistics', { team: awayTeamId, league: leagueId, season: season });
  const headToHeadPromise = apiFootballGet('/fixtures/headtohead', { h2h: homeTeamId + '-' + awayTeamId, last: 5 });

  const homeForm = await homeFormPromise;
  const awayForm = await awayFormPromise;
  const headToHead = await headToHeadPromise;

  return {
    homeForm: summarizeTeamStats(homeForm),
    awayForm: summarizeTeamStats(awayForm),
    headToHead: (headToHead || []).map(normalizeFixture)
  };
}

function normalizeFixture(raw) {
  return {
    fixtureId: raw.fixture.id,
    date: raw.fixture.date,
    status: raw.fixture.status.short,
    venue: raw.fixture.venue ? raw.fixture.venue.name : null,
    league: raw.league.name,
    homeTeam: { id: raw.teams.home.id, name: raw.teams.home.name },
    awayTeam: { id: raw.teams.away.id, name: raw.teams.away.name },
    goals: raw.goals
  };
}

function summarizeTeamStats(raw) {
  if (!raw) return null;
  return {
    played: raw.fixtures && raw.fixtures.played ? raw.fixtures.played.total : null,
    wins: raw.fixtures && raw.fixtures.wins ? raw.fixtures.wins.total : null,
    draws: raw.fixtures && raw.fixtures.draws ? raw.fixtures.draws.total : null,
    losses: raw.fixtures && raw.fixtures.loses ? raw.fixtures.loses.total : null,
    goalsForAvg: raw.goals && raw.goals.for ? raw.goals.for.average.total : null,
    goalsAgainstAvg: raw.goals && raw.goals.against ? raw.goals.against.average.total : null,
    form: raw.form
  };
}