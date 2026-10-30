import express from 'express';
import { getDestinations } from '../controllers/destinationController.js';

const router = express.Router();

router.post('/', getDestinations);

export default router;
