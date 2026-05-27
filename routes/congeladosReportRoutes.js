import express from 'express';
import {
  createCongeladosReport,
  getCongeladosHistory,
  deleteCongeladosReport,
} from '../controllers/congeladosReportController.js';

// 🚩 Asegúrate de que esta ruta apunte a tu middleware real de JWT
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas
router.post('/', verifyToken, createCongeladosReport);
router.get('/', verifyToken, getCongeladosHistory);
router.delete('/:id', verifyToken, deleteCongeladosReport);

export default router;
