import express from 'express';
import {
  getAllConfigs,
  updateConfig,
} from '../controllers/documentConfigController.js';
import {
  verifyToken,
  requirePermissions,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Cualquier usuario autenticado puede leer la configuración para llenar su formato
router.get('/document-configs', verifyToken, getAllConfigs);

// SOLAMENTE Roles 3 (Admin) y 4 (Encargado/Supervisor de Mantenimiento) pueden modificar
router.put(
  '/document-configs/:area_key',
  verifyToken,
  requirePermissions([3, 4]),
  updateConfig,
);

export default router;
