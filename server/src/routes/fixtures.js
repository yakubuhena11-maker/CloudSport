import { Router } from 'express';
import { getUpcomingFixtures } from '../services/dataProvider.js';

const router = Router();

// GET /api/fixtures?leagueId=39
router.get('/', async (req, res) => {
  try {
    const { leagueId } = req.query;
    const fixtures = await getUpcomingFixtures({ leagueId: leagueId ? Number(leagueId) : undefined });
    res.json({ fixtures });
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch fixtures', detail: err.message });
  }
});

export default router;