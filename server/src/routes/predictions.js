import { Router } from 'express';
import { getMatchContext } from '../services/dataProvider.js';
import { predictMatchResult } from '../services/aiEngine.js';

const router = Router();

// POST /api/predictions  { fixture: {...} }
// fixture must include fixtureId, homeTeam:{id,name}, awayTeam:{id,name}, league, date
router.post('/', async (req, res) => {
  try {
    const { fixture } = req.body;
    if (!fixture?.homeTeam?.id || !fixture?.awayTeam?.id) {
      return res.status(400).json({ error: 'fixture with homeTeam.id and awayTeam.id is required' });
    }

    const { homeForm, awayForm, headToHead } = await getMatchContext({
      homeTeamId: fixture.homeTeam.id,
      awayTeamId: fixture.awayTeam.id,
    });

    const prediction = await predictMatchResult({ fixture, homeForm, awayForm, headToHead });
    res.json({ fixture, prediction });
  } catch (err) {
    res.status(502).json({ error: 'Could not generate prediction', detail: err.message });
  }
});

export default router;