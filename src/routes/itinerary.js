import express from 'express';
import { getItinerary } from '../controllers/itineraryController.js';

const router = express.Router();

router.post('/', getItinerary);

export default router;
