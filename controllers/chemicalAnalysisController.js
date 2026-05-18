// 🚩 Importamos desde index.js para que las relaciones (populados) funcionen
import { ChemicalDailyLog, ChemicalReading, User } from '../models/index.js';

// 🚩 UTILERÍA: Las lecturas del Turno C (ej. 02:00, 04:00) pertenecen a la producción del día anterior
const getProductionDate = () => {
  const now = new Date();
  if (now.getHours() < 6) {
    now.setDate(now.getDate() - 1);
  }
  // Formato YYYY-MM-DD
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

// 🚩 POST: Crear/Actualizar Hoja del Día y agregar Lectura
export const createAnalysisRecord = async (req, res) => {
  try {
    const {
      assetId,
      turno,
      timestampHour,
      resultados,
      observaciones,
      codigo_documento,
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    } = req.body;

    if (!turno || !timestampHour || !resultados) {
      return res
        .status(400)
        .json({ success: false, message: 'Faltan parámetros obligatorios.' });
    }

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Error de Trazabilidad: Usuario no identificado.',
        });
    }

    const currentOpId = req.user.id;
    const prodDate = getProductionDate();
    const asset = assetId || 'analisis_quimicos_vapor';

    // 1. ENCONTRAR O CREAR LA HOJA MAESTRA DEL DÍA
    let [dailyLog] = await ChemicalDailyLog.findOrCreate({
      where: { productionDate: prodDate, assetId: asset },
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

    // 2. ACTUALIZAR FIRMAS Y METADATOS EN EL MAESTRO SEGÚN EL TURNO
    const logUpdates = {
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    };
    if (turno === 'A') logUpdates.operatorA_id = currentOpId;
    if (turno === 'B') logUpdates.operatorB_id = currentOpId;
    if (turno === 'C') logUpdates.operatorC_id = currentOpId;

    await dailyLog.update(logUpdates);

    // 3. ACTUALIZAR O INSERTAR LA LECTURA (RENGLÓN) EN LA HOJA
    let reading = await ChemicalReading.findOne({
      where: { logId: dailyLog.id, timestampHour },
    });

    if (reading) {
      await reading.update({
        resultados,
        observaciones,
        operatorId: currentOpId,
        turno,
      });
    } else {
      reading = await ChemicalReading.create({
        logId: dailyLog.id,
        turno,
        timestampHour,
        resultados,
        observaciones,
        operatorId: currentOpId,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Análisis químico y metadatos SGC registrados con éxito.',
      data: { log: dailyLog, reading },
    });
  } catch (error) {
    console.error('❌ Error en createAnalysisRecord:', error);
    return res
      .status(500)
      .json({
        success: false,
        message: 'Error interno en el servidor.',
        error: error.message,
      });
  }
};

// 🚩 GET: Extraer el Historial Completo (Hojas + Renglones + Nombres de Firmas)
export const getAnalysisHistory = async (req, res) => {
  try {
    const logs = await ChemicalDailyLog.findAll({
      where: { activo: true }, // 🚩 Ignora los inhabilitados
      order: [['productionDate', 'DESC']],
      limit: 100,
      include: [
        {
          model: ChemicalReading,
          as: 'readings',
          order: [['timestampHour', 'ASC']], // Renglones ordenados por hora
          include: [
            { model: User, as: 'operator', attributes: ['name', 'surname'] },
          ],
        },
        { model: User, as: 'operatorA', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorB', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorC', attributes: ['name', 'surname'] },
        { model: User, as: 'supervisor', attributes: ['name', 'surname'] },
      ],
    });

    return res
      .status(200)
      .json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('❌ Error en getAnalysisHistory:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error al recuperar el historial.' });
  }
};

// 🚩 PUT: Actualizar una Bitácora Específica
export const updateAnalysisRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ChemicalDailyLog.findByPk(id);

    if (!record || !record.activo) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Bitácora no encontrada o inhabilitada.',
        });
    }

    await record.update(req.body);

    return res
      .status(200)
      .json({
        success: true,
        message: `Registro actualizado correctamente.`,
        data: record,
      });
  } catch (error) {
    console.error('❌ Error en updateAnalysisRecord:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error al actualizar el registro.' });
  }
};

// 🚩 DELETE COMPLETO CON SOFT DELETE (Inhabilita toda la hoja maestra del día)
export const deleteAnalysisRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ChemicalDailyLog.findByPk(id);

    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: 'La bitácora no existe.' });
    }

    // Pasa la hoja entera a inactiva, ocultándola del frontend
    await record.update({ activo: false });

    return res
      .status(200)
      .json({
        success: true,
        message: `Bitácora inhabilitada con éxito (Soft Delete aplicado).`,
      });
  } catch (error) {
    console.error('❌ Error en deleteAnalysisRecord:', error);
    return res
      .status(500)
      .json({
        success: false,
        message: 'Error al ejecutar el borrado lógico.',
      });
  }
};
