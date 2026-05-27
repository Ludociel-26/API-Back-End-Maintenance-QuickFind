import express from 'express';
import {
  createCompressorReport,
  getCompressorHistory,
  deleteCompressorReport,
} from '../controllers/compressorController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Ajusta según tu path

const router = express.Router();

router.post('/', verifyToken, createCompressorReport);
router.get('/', verifyToken, getCompressorHistory);
router.delete('/:id', verifyToken, deleteCompressorReport);

export default router;
