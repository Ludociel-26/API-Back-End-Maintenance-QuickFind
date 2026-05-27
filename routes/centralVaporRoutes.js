import express from 'express';
import {
  createVaporReport,
  getVaporHistory,
  deleteVaporReport,
} from '../controllers/centralVaporController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createVaporReport);
router.get('/', verifyToken, getVaporHistory);
router.delete('/:id', verifyToken, deleteVaporReport);

export default router;
