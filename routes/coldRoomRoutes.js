import express from 'express';
import {
  createColdRoomReport,
  getColdRoomHistory,
  deleteColdRoomReport,
} from '../controllers/coldRoomController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Ajusta según tu nombre de middleware de sesión

const router = express.Router();

router.post('/', verifyToken, createColdRoomReport);
router.get('/', verifyToken, getColdRoomHistory);
router.delete('/:id', verifyToken, deleteColdRoomReport);

export default router;
