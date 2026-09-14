import { Router } from 'express';
import { getUpcomingFixtures } from '../services/dataProvider.js';

const router = Router();

// GET /api/fixtures?competitionCode=PL
router.get('/', async (req, res) => {
  try {
    const { competitionCode } = req.query;
    const fixtures = await getUpcomingFixtures({ competitionCode: competitionCode || undefined });
    res.json({ fixtures });
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch fixtures', detail: err.message });
  }
});

export default router;