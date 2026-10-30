import express from 'express';
import { getPackingList } from '../controllers/packingController.js';

const router = express.Router();

router.post('/', getPackingList);

export default router;
