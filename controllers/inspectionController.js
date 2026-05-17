import { sequelize } from '../config/postgresdb.js';
import {
  Inspection,
  InspectionTask,
  User,
  Role,
  LevelArea,
} from '../models/index.js';
import logger from '../logger.js';

// ==========================================
// 1. CREATE (Crear una inspección)
// ==========================================
export const createInspection = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // 🚩 Extraemos la metadata enviada por el Frontend
    const { area, turno, checks, metadata } = req.body;
    const userId = req.user.id;

    if (!area || !turno || !checks || !metadata) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos o metadata del documento.',
      });
    }

    // 1. Insertar Cabecera con Snapshot de Calidad
    const newInspection = await Inspection.create(
      {
        area,
        shift: turno,
        userId,
        // Guardamos la radiografía del documento en este instante de tiempo
        codigo_documento: metadata.codigo_documento,
        version: metadata.version,
        fecha_revision: metadata.fecha_revision,
        fecha_reemplazo: metadata.fecha_reemplazo,
        propietario: metadata.propietario,
        aprobador: metadata.aprobador,
        estandar_calidad: metadata.estandar_calidad,
        razon_cambio: metadata.razon_cambio,
        status: 'SUBMITTED', // Siempre entra como enviado
      },
      { transaction: t },
    );

    // 2. Mapear y hacer Bulk Insert de tareas
    const tasksToInsert = Object.entries(checks).map(([taskId, data]) => {
      const isAnomaly = data.status === 'ANORMAL' || data.status === 'FALLA';
      return {
        inspectionId: newInspection.id,
        taskId,
        valueString: data.status,
        isAnomaly,
        comments: isAnomaly ? data.comments : null,
      };
    });

    await InspectionTask.bulkCreate(tasksToInsert, { transaction: t });
    await t.commit();

    return res.status(201).json({
      success: true,
      message: 'Guardado exitosamente',
      data: newInspection,
    });
  } catch (error) {
    await t.rollback();
    console.error(`Error guardando inspección: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error en BD al guardar la inspección.',
    });
  }
};

// ==========================================
// 2. READ ALL (Obtener listado general)
// ==========================================
export const getInspections = async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'operator',
          // 🚩 Privacidad: Excluimos el email. Solo enviamos ID y nombre completo.
          attributes: ['id', 'name', 'surname'],
          include: [
            // 🚩 Limpieza: Solo extraemos el 'name' del rol y el 'level' del área. Cero IDs.
            { model: Role, as: 'roleData', attributes: ['name'] },
            { model: LevelArea, as: 'areaData', attributes: ['level'] },
          ],
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'surname'],
          include: [
            { model: Role, as: 'roleData', attributes: ['name'] },
            // 🚩 Solución: Agregamos el área del supervisor trayendo únicamente el 'level'.
            { model: LevelArea, as: 'areaData', attributes: ['level'] },
          ],
        },
        {
          model: InspectionTask,
          as: 'tasks',
          // Opcional: Si quieres limpiar también las tareas, puedes definir attributes aquí.
          attributes: ['taskId', 'valueString', 'isAnomaly', 'comments'],
        },
      ],
    });

    return res.status(200).json({ success: true, data: inspections });
  } catch (error) {
    logger.error(`Error obteniendo inspecciones: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar datos relacionales.',
    });
  }
};

// ==========================================
// 3. READ ONE (Obtener una inspección por ID)
// ==========================================
export const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, {
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'name', 'surname'],
          include: [
            { model: Role, as: 'roleData', attributes: ['name'] },
            { model: LevelArea, as: 'areaData', attributes: ['level'] },
          ],
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'name', 'surname'],
          include: [
            { model: Role, as: 'roleData', attributes: ['name'] },
            { model: LevelArea, as: 'areaData', attributes: ['level'] },
          ],
        },
        {
          model: InspectionTask,
          as: 'tasks',
          attributes: ['taskId', 'valueString', 'isAnomaly', 'comments'],
        },
      ],
    });

    if (!inspection) {
      return res
        .status(404)
        .json({ success: false, message: 'Inspección no encontrada.' });
    }

    return res.status(200).json({ success: true, data: inspection });
  } catch (error) {
    logger.error(
      `Error obteniendo inspección ${req.params.id}: ${error.message}`,
    );
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al consultar.',
    });
  }
};

// ==========================================
// 4. UPDATE (Actualizar datos o asignar supervisor)
// ==========================================
export const updateInspection = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { area, shift, status, supervisorId, checks } = req.body;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: 'Inspección no encontrada.' });
    }

    // 🛡️ VALIDACIÓN: Supervisor Opcional
    if (supervisorId && supervisorId !== inspection.supervisorId) {
      const supervisorUser = await User.findByPk(supervisorId, {
        attributes: ['id', 'rol_id'],
      });

      if (!supervisorUser) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'El ID de supervisor proporcionado no existe.',
        });
      }

      if (supervisorUser.rol_id !== 4) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Integridad rechazada: El usuario (ID: ${supervisorId}) tiene el Rol ${supervisorUser.rol_id}. Debe ser Rol 4.`,
        });
      }
    }

    await inspection.update(
      {
        area: area !== undefined ? area : inspection.area,
        shift: shift !== undefined ? shift : inspection.shift,
        status: status !== undefined ? status : inspection.status,
        supervisorId:
          supervisorId !== undefined ? supervisorId : inspection.supervisorId,
      },
      { transaction: t },
    );

    // Reemplazo destructivo de tareas
    if (checks && Object.keys(checks).length > 0) {
      await InspectionTask.destroy({
        where: { inspectionId: id },
        transaction: t,
      });

      const tasksToInsert = Object.entries(checks).map(([taskId, data]) => {
        const isAnomaly = data.status === 'ANORMAL' || data.status === 'FALLA';
        return {
          inspectionId: id,
          taskId,
          valueString: data.status,
          isAnomaly: isAnomaly,
          comments: isAnomaly ? data.comments : null,
        };
      });
      await InspectionTask.bulkCreate(tasksToInsert, { transaction: t });
    }

    await t.commit();
    logger.info(`Inspección ${id} actualizada exitosamente.`);

    return res.status(200).json({
      success: true,
      message: 'Inspección actualizada correctamente.',
    });
  } catch (error) {
    await t.rollback();
    logger.error(
      `Error actualizando inspección ${req.params.id}: ${error.message}`,
    );
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar la actualización.',
    });
  }
};

// ==========================================
// 5. DELETE (Eliminar una inspección)
// ==========================================
export const deleteInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id);

    if (!inspection) {
      return res
        .status(404)
        .json({ success: false, message: 'Inspección no encontrada.' });
    }

    // El cascade eliminará las tareas de inspection_tasks automáticamente
    await inspection.destroy();

    logger.info(`Inspección ${id} eliminada.`);
    return res
      .status(200)
      .json({ success: true, message: 'Inspección eliminada correctamente.' });
  } catch (error) {
    logger.error(
      `Error eliminando inspección ${req.params.id}: ${error.message}`,
    );
    return res
      .status(500)
      .json({ success: false, message: 'Error interno al intentar eliminar.' });
  }
};
