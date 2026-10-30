import 'dotenv/config';
import express from 'express';
import destinationRoutes from './src/routes/destination.js';
import itineraryRoutes from './src/routes/itinerary.js';
import packingRoutes from './src/routes/packing.js';
import splitbillRoutes from './src/routes/splitbill.js';

const app = express();

app.use(express.json());

// Sajikan file statis dari folder 'public'
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.use('/api/destination', destinationRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/splitbill', splitbillRoutes);

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));