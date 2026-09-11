import { Router } from 'express';
import { createTicket, getTicket, listTicketsForUser, deleteTicket } from '../services/ticketService.js';

const router = Router();

// POST /api/tickets  { userId, selections: [{ fixtureId, market, pick, probability }] }
router.post('/', (req, res) => {
  const { userId, selections } = req.body;
  if (!userId || !Array.isArray(selections) || selections.length === 0) {
    return res.status(400).json({ error: 'userId and a non-empty selections array are required' });
  }
  const ticket = createTicket({ userId, selections });
  res.status(201).json({ ticket });
});

// GET /api/tickets/:id
router.get('/:id', (req, res) => {
  const ticket = getTicket(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
});

// GET /api/tickets?userId=123
router.get('/', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  res.json({ tickets: listTicketsForUser(userId) });
});

// DELETE /api/tickets/:id
router.delete('/:id', (req, res) => {
  const deleted = deleteTicket(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Ticket not found' });
  res.status(204).send();
});

export default router;