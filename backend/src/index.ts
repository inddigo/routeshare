import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateTrip } from './controllers/tripController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/trips/:bookingId/validate', validateTrip);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RouteShare Backend is running.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
