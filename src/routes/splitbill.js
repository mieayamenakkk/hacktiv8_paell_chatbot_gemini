import express from 'express';
import { getSplitBill } from '../controllers/splitbillController.js';

const router = express.Router();

router.post('/', getSplitBill);

export default router;
