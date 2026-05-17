import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../logger.js';

// ==========================================
// 1. Verificación del Token (Headers y Cookies)
// ==========================================
export const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Primero buscamos si el Frontend nos mandó una Cookie HttpOnly
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Si no hay cookie, buscamos en los Headers (Fallback)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'null' || token === 'undefined') {
      logger.warn(
        'Intento de acceso rechazado: No se detectó Cookie ni Header de autorización.',
      );
      return res
        .status(401)
        .json({
          success: false,
          message: 'Acceso denegado. Se requiere sesión activa.',
        });
    }

    // Decodificamos usando el secreto de entorno
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tu_secreto_aqui',
    );

    // Obtenemos al usuario desde el modelo Proxy
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'rol_id', 'area_id', 'is_active'],
    });

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Fallo de integridad: El usuario de la sesión no existe.',
        });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Su cuenta ha sido desactivada temporalmente.',
        });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Error de validación JWT: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({
          success: false,
          message:
            'El tiempo de su sesión ha concluido. Inicie sesión de nuevo.',
        });
    }
    return res
      .status(401)
      .json({
        success: false,
        message: 'Token de seguridad inválido o corrupto.',
      });
  }
};

// ==========================================
// 2. Control de Acceso Estricto (RBAC / ABAC)
// ==========================================
export const requirePermissions = (allowedRoles) => {
  return (req, res, next) => {
    const { rol_id, area_id } = req.user;

    // Bloqueo total al Rol 1 (Usuario estándar)
    if (rol_id === 1) {
      logger.warn(
        `Brecha interceptada: Usuario ${req.user.id} (Rol 1) intentó acceder al módulo de Mantenimiento.`,
      );
      return res
        .status(403)
        .json({
          success: false,
          message: 'Nivel de acceso insuficiente. Módulo restringido.',
        });
    }

    // Regla de Negocio: Operadores (Rol 2) deben ser del Área 2 (Mantenimiento)
    if (rol_id === 2 && area_id !== 2) {
      logger.warn(
        `Acceso denegado: Usuario ${req.user.id} (Área ${area_id}) fuera de jurisdicción operativa.`,
      );
      return res
        .status(403)
        .json({
          success: false,
          message: 'Operación denegada. Área operativa sin jurisdicción.',
        });
    }

    // Validación del vector de roles
    if (!allowedRoles.includes(rol_id)) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'No cuenta con los privilegios necesarios para esta acción.',
        });
    }

    next();
  };
};
