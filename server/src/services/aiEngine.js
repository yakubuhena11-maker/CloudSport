// aiEngine.js
// Phase 1 scope: single market (match result) prediction with explanation,
// reasoning over stats fetched from dataProvider.js. No fabricated stats —
// the model only sees numbers we pass it (ties to AO: AI quality & safety controls).
//
// FREE FALLBACK MODE: if ANTHROPIC_API_KEY is unset, or a call fails due to
// billing/credits, this falls back to a simple rule-based estimate using the
// same stats (goal averages + head-to-head), so the fixtures -> prediction ->
// ticket loop still works end to end without needing paid API credits. Swap
// back to full Claude reasoning any time by adding credits -- no other code
// needs to change.

import Anthropic from '@anthropic-ai/sdk';

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const SYSTEM_PROMPT = 'You are CloudSport\'s match analysis engine. You produce probability estimates for football match outcomes based ONLY on the statistics provided to you in the user message. Never invent statistics, injuries, or news not present in the input. Always give a probability estimate for home win, draw, and away win that sums to 100, a confidence level of low, medium, or high, 2 to 4 supporting factors, and at least one source of uncertainty. Make clear this is a statistical estimate, not a guaranteed outcome. Respond ONLY with JSON, no preamble, no markdown fences.';

export async function predictMatchResult(input) {
  const fixture = input.fixture;
  const homeForm = input.homeForm;
  const awayForm = input.awayForm;
  const headToHead = input.headToHead;

  if (!client) {
    return ruleBasedPrediction(homeForm, awayForm, headToHead);
  }

  try {
    const userPrompt = buildPrompt(fixture, homeForm, awayForm, headToHead);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textBlock = response.content.find(function (block) { return block.type === 'text'; });
    const text = textBlock ? textBlock.text : '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    parsed.model_version = MODEL;
    parsed.generated_at = new Date().toISOString();
    return parsed;
  } catch (err) {
    return ruleBasedPrediction(homeForm, awayForm, headToHead);
  }
}

function ruleBasedPrediction(homeForm, awayForm, headToHead) {
  const homeAttack = numberOr(homeForm && homeForm.goalsForAvg, 1.3);
  const homeDefense = numberOr(homeForm && homeForm.goalsAgainstAvg, 1.3);
  const awayAttack = numberOr(awayForm && awayForm.goalsForAvg, 1.1);
  const awayDefense = numberOr(awayForm && awayForm.goalsAgainstAvg, 1.4);

  const homeStrength = homeAttack - awayDefense + 0.25;
  const awayStrength = awayAttack - homeDefense;
  const diff = homeStrength - awayStrength;

  let prediction;
  let probabilities;
  if (diff > 0.4) {
    prediction = 'home_win';
    probabilities = { home_win: 55, draw: 25, away_win: 20 };
  } else if (diff < -0.4) {
    prediction = 'away_win';
    probabilities = { home_win: 20, draw: 25, away_win: 55 };
  } else {
    prediction = 'draw';
    probabilities = { home_win: 33, draw: 34, away_win: 33 };
  }

  const supportingFactors = [
    'Home team season goals-for average: ' + homeAttack,
    'Away team season goals-for average: ' + awayAttack,
    'Home advantage applied as a fixed adjustment'
  ];
  if (headToHead && headToHead.length > 0) {
    supportingFactors.push(headToHead.length + ' historical head-to-head meeting(s) available');
  }

  return {
    prediction: prediction,
    probabilities: probabilities,
    confidence: 'low',
    supporting_factors: supportingFactors,
    uncertainty: 'This is a simplified statistical estimate (rule-based fallback), not an AI-reasoned analysis. Confidence is intentionally capped.',
    model_version: 'rule-based-fallback-v1',
    generated_at: new Date().toISOString()
  };
}

function numberOr(value, fallback) {
  return typeof value === 'number' ? value : fallback;
}

function buildPrompt(fixture, homeForm, awayForm, headToHead) {
  const h2hSummary = headToHead.map(function (h) {
    return {
      date: h.date,
      result: h.homeTeam.name + ' ' + h.goals.home + '-' + h.goals.away + ' ' + h.awayTeam.name
    };
  });

  return 'Match: ' + fixture.homeTeam.name + ' vs ' + fixture.awayTeam.name + '\n' +
    'League: ' + fixture.league + '\n' +
    'Date: ' + fixture.date + '\n\n' +
    'Home team form (this season): ' + JSON.stringify(homeForm) + '\n' +
    'Away team form (this season): ' + JSON.stringify(awayForm) + '\n' +
    'Head-to-head (last ' + headToHead.length + ' meetings): ' + JSON.stringify(h2hSummary) + '\n\n' +
    'Analyze this match result market using only the data above.';
}