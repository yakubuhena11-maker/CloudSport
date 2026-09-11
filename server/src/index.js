import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fixturesRouter from './routes/fixtures.js';
import predictionsRouter from './routes/predictions.js';
import ticketsRouter from './routes/tickets.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cloudsport-server' });
});

app.use('/api/fixtures', fixturesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/tickets', ticketsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`CloudSport server running on port ${PORT}`);
});