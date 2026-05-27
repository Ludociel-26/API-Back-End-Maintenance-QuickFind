import {
  CongeladosDailyLog,
  CongeladosDailyTask,
  User,
} from '../models/index.js';

// Utilería: Determinar a qué día de producción pertenece (Corte a las 6 AM)
const getProductionDate = () => {
  const now = new Date();
  if (now.getHours() < 6) {
    now.setDate(now.getDate() - 1);
  }
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export const createCongeladosReport = async (req, res) => {
  try {
    const {
      turno,
      evaluations,
      observacionesGlobales,
      codigo_documento,
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    } = req.body;

    if (!turno || !evaluations) {
      return res
        .status(400)
        .json({ success: false, message: 'Faltan parámetros obligatorios.' });
    }

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: 'Operador no identificado.' });
    }

    const currentOpId = req.user.id;
    const prodDate = getProductionDate();

    // 1. Encontrar o Crear la Hoja Maestra del Día
    let [dailyLog] = await CongeladosDailyLog.findOrCreate({
      where: { productionDate: prodDate },
      defaults: {
        codigo_documento,
        version,
        fecha_revision,
        fecha_reemplazo,
        propietario,
        aprobador,
        estandar_calidad,
        razon_cambio,
      },
    });

    // 2. Actualizar metadatos, limpieza global, observaciones y firma del turno
    const logUpdates = {
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    };

    if (observacionesGlobales) {
      logUpdates.observaciones_generales = dailyLog.observaciones_generales
        ? `${dailyLog.observaciones_generales}\n[Turno ${turno}]: ${observacionesGlobales}`
        : `[Turno ${turno}]: ${observacionesGlobales}`;
    }

    if (evaluations['limpieza_area']?.status === true) {
      logUpdates.limpieza_completada = true;
    }

    if (turno === 'A') logUpdates.operatorA_id = currentOpId;
    if (turno === 'B') logUpdates.operatorB_id = currentOpId;
    if (turno === 'C') logUpdates.operatorC_id = currentOpId;

    await dailyLog.update(logUpdates);

    // 3. Procesar las Evaluaciones (Tareas individuales - Upsert)
    const taskPromises = Object.entries(evaluations).map(
      async ([taskId, evalData]) => {
        if (taskId === 'limpieza_area') return; // Ya se guardó globalmente

        const { status, comments } = evalData;

        let task = await CongeladosDailyTask.findOne({
          where: { logId: dailyLog.id, taskId, turno },
        });

        if (task) {
          return task.update({ status, comments, operatorId: currentOpId });
        } else {
          return CongeladosDailyTask.create({
            logId: dailyLog.id,
            turno,
            taskId,
            status,
            comments,
            operatorId: currentOpId,
          });
        }
      },
    );

    await Promise.all(taskPromises);

    return res.status(201).json({
      success: true,
      message: `Reporte de Congelados guardado para el turno ${turno}.`,
    });
  } catch (error) {
    console.error('❌ Error en createCongeladosReport:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error interno en el servidor.' });
  }
};

export const getCongeladosHistory = async (req, res) => {
  try {
    const logs = await CongeladosDailyLog.findAll({
      where: { activo: true },
      order: [['productionDate', 'DESC']],
      limit: 100,
      include: [
        {
          model: CongeladosDailyTask,
          as: 'tasks',
          include: [
            { model: User, as: 'operator', attributes: ['name', 'surname'] },
          ],
        },
        { model: User, as: 'operatorA', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorB', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorC', attributes: ['name', 'surname'] },
      ],
    });

    return res
      .status(200)
      .json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('❌ Error en getCongeladosHistory:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error al recuperar el historial.' });
  }
};

export const deleteCongeladosReport = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await CongeladosDailyLog.findByPk(id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: 'Bitácora no encontrada.' });

    await record.update({ activo: false });
    return res
      .status(200)
      .json({ success: true, message: 'Bitácora inhabilitada con éxito.' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error lógico en BD.' });
  }
};
