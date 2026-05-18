import express from 'express';
import {
  createAnalysisRecord,
  getAnalysisHistory,
  updateAnalysisRecord,
  deleteAnalysisRecord,
} from '../controllers/chemicalAnalysisController.js';

// 🚩 IMPORTA TU MIDDLEWARE REAL DE AUTENTICACIÓN (Donde verificas el JWT)
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicamos el CRUD completo asignando identificadores por parámetros de ruta (:id)
// 🚩 NOTA: Pasamos 'verifyToken' primero para inyectar el req.user.id obligatoriamente
router.post('/', verifyToken, createAnalysisRecord);
router.get('/', verifyToken, getAnalysisHistory);
router.put('/:id', verifyToken, updateAnalysisRecord);
router.delete('/:id', verifyToken, deleteAnalysisRecord);

export default router;
