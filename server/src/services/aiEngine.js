// aiEngine.js
// Phase 1 scope: single market (match result) prediction with explanation,
// reasoning over stats fetched from dataProvider.js. No fabricated stats —
// the model only sees numbers we pass it (ties to AO: AI quality & safety controls).

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const SYSTEM_PROMPT = `You are CloudSport's match analysis engine.
You produce probability estimates for football match outcomes based ONLY on the
statistics provided to you in the user message. Never invent statistics, injuries,
or news not present in the input. Always:
- Give a probability estimate for home win / draw / away win that sums to 100.
- Give an overall confidence level: low, medium, or high.
- List the 2-4 supporting factors from the provided data that most influenced the estimate.
- Note at least one source of uncertainty.
- Make clear this is a statistical estimate, not a guaranteed outcome.
Respond ONLY with JSON, no preamble, no markdown fences, matching this shape:
{
  "prediction": "home_win" | "draw" | "away_win",
  "probabilities": { "home_win": number, "draw": number, "away_win": number },
  "confidence": "low" | "medium" | "high",
  "supporting_factors": string[],
  "uncertainty": string,
  "model_version": string
}`;

export async function predictMatchResult({ fixture, homeForm, awayForm, headToHead }) {
  const userPrompt = buildPrompt({ fixture, homeForm, awayForm, headToHead });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content.find((block) => block.type === 'text')?.text || '{}';
  const cleaned = text.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return { ...parsed, model_version: MODEL, generated_at: new Date().toISOString() };
  } catch (err) {
    throw new Error(`Failed to parse AI prediction response: ${err.message}`);
  }
}

function buildPrompt({ fixture, homeForm, awayForm, headToHead }) {
  return `Match: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}
League: ${fixture.league}
Date: ${fixture.date}

Home team form (this season): ${JSON.stringify(homeForm)}
Away team form (this season): ${JSON.stringify(awayForm)}
Head-to-head (last ${headToHead.length} meetings): ${JSON.stringify(
    headToHead.map((h) => ({
      date: h.date,
      result: `${h.homeTeam.name} ${h.goals.home}-${h.goals.away} ${h.awayTeam.name}`,
    }))
  )}

Analyze this match result market using only the data above.`;
}