// ticketService.js
// Phase 1 scope: in-memory placeholder. Replace with Postgres-backed storage
// once the DB schema (server/src/models) is wired up.

const tickets = new Map();
let nextId = 1;

export function createTicket({ userId, selections }) {
  const id = String(nextId++);
  const combinedProbability = selections.reduce(
    (acc, s) => acc * (s.probability / 100),
    1
  ) * 100;

  const ticket = {
    id,
    userId,
    selections,
    combinedProbability: Number(combinedProbability.toFixed(2)),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };

  tickets.set(id, ticket);
  return ticket;
}

export function getTicket(id) {
  return tickets.get(id) || null;
}

export function listTicketsForUser(userId) {
  return [...tickets.values()].filter((t) => t.userId === userId);
}

export function deleteTicket(id) {
  return tickets.delete(id);
}