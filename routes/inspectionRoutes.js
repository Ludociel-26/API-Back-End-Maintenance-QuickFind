import express from 'express';
import {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
} from '../controllers/inspectionController.js';
import {
  verifyToken,
  requirePermissions,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. OBLIGATORIO: Todas las rutas de inspección requieren un JWT válido
router.use(verifyToken);

// 2. RUTAS DE LECTURA (Consultas) -> Permitido para Operadores (2), Admins (3) y Supervisores (4)
router.get('/', requirePermissions([2, 3, 4]), getInspections);
router.get('/:id', requirePermissions([2, 3, 4]), getInspectionById);

// 3. RUTAS DE ESCRITURA (Crear) -> Permitido para Operadores (2), Admins (3) y Supervisores (4)
router.post('/', requirePermissions([2, 3, 4]), createInspection);

// 4. RUTAS CRÍTICAS (Actualizar y Eliminar) -> CRUD Completo SOLO para Admins (3) y Supervisores (4)
// 🚩 El rol 2 (Operador) será rechazado automáticamente si intenta hacer PUT o DELETE
router.put('/:id', requirePermissions([3, 4]), updateInspection);
router.delete('/:id', requirePermissions([3, 4]), deleteInspection);

export default router;
