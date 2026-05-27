import { ColdRoomDailyLog, ColdRoomReading, User } from '../models/index.js';

// Calcula el día de producción correcto. Si se captura entre 00:00 y 06:00, pertenece al día anterior.
const getProductionDate = (horaLectura) => {
  const now = new Date();
  const hourNum = parseInt(horaLectura.split(':')[0], 10);

  if (hourNum < 6) {
    now.setDate(now.getDate() - 1);
  }

  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export const createColdRoomReport = async (req, res) => {
  try {
    const { turno, timestampHour, telemetry, observaciones, metadata } =
      req.body;
    const currentOpId = req.user?.id || null;

    if (!turno || !timestampHour || !telemetry) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros obligatorios de telemetría.',
      });
    }

    const prodDate = getProductionDate(timestampHour);

    // 🚩 SOLUCIÓN DE ARQUITECTURA:
    // Extraemos 'area_key' del metadata para que Sequelize no intente guardarlo
    // en la tabla de bitácoras (la cual no tiene esa columna) eliminando el Warning.
    const { area_key, ...cleanMetadata } = metadata || {};

    // 1. Maestro: Buscar o crear bitácora del día correspondiente
    let [log] = await ColdRoomDailyLog.findOrCreate({
      where: { productionDate: prodDate },
      defaults: { ...cleanMetadata, productionDate: prodDate },
    });

    // 2. Maestro: Actualizar metadata SGC, observaciones acumuladas y firmas de control
    const logUpdates = { ...cleanMetadata };
    if (observaciones) logUpdates.observaciones = observaciones;

    if (turno === 'A') logUpdates.operatorA_id = currentOpId;
    if (turno === 'B') logUpdates.operatorB_id = currentOpId;
    if (turno === 'C') logUpdates.operatorC_id = currentOpId;

    await log.update(logUpdates);

    // 3. Detalle: Guardar o actualizar la fila de la hora correspondiente
    let reading = await ColdRoomReading.findOne({
      where: { logId: log.id, hora: timestampHour },
    });

    const readingPayload = {
      nivel_refrigerante: telemetry.nivel_refrigerante,
      pres_succion: telemetry.pres_succion,
      pres_descarga: telemetry.pres_descarga,
      pct_carga: telemetry.pct_carga,
      nivel_aceite: telemetry.nivel_aceite,
      evap_1: telemetry.evap_1,
      evap_2: telemetry.evap_2,
      evap_3: telemetry.evap_3,
      evap_4: telemetry.evap_4,
      evap_5: telemetry.evap_5,
      evap_6: telemetry.evap_6,
      evap_7: telemetry.evap_7,
      evap_8: telemetry.evap_8,
      temp_ambiente: telemetry.temp_ambiente,
      temp_cuarto_1: telemetry.temp_cuarto_1,
      temp_cuarto_2: telemetry.temp_cuarto_2,
      temp_cuarto_3: telemetry.temp_cuarto_3,
      apagadores_encendidos: telemetry.apagadores_encendidos,
      turno,
      operatorId: currentOpId,
    };

    if (reading) {
      await reading.update(readingPayload);
    } else {
      await ColdRoomReading.create({
        logId: log.id,
        hora: timestampHour,
        ...readingPayload,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Métricas de las ${timestampHour} horas registradas con éxito.`,
    });
  } catch (error) {
    // Log estandarizado profesional
    console.error(
      `[ERROR] Controller: createColdRoomReport failed - ${error.message}`,
    );
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar los datos de telemetría.',
    });
  }
};

export const getColdRoomHistory = async (req, res) => {
  try {
    const logs = await ColdRoomDailyLog.findAll({
      where: { activo: true },
      order: [['productionDate', 'DESC']],
      limit: 60,
      include: [
        {
          model: ColdRoomReading,
          as: 'readings',
          include: [
            { model: User, as: 'operator', attributes: ['name', 'surname'] },
          ],
        },
        { model: User, as: 'operatorA', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorB', attributes: ['name', 'surname'] },
        { model: User, as: 'operatorC', attributes: ['name', 'surname'] },
      ],
    });
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(
      `[ERROR] Controller: getColdRoomHistory failed - ${error.message}`,
    );
    return res.status(500).json({
      success: false,
      message: 'Error al recuperar el historial operativo del Cuarto Frío #5.',
    });
  }
};

export const deleteColdRoomReport = async (req, res) => {
  try {
    const record = await ColdRoomDailyLog.findByPk(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: 'Bitácora no encontrada.' });
    }

    await record.update({ activo: false });
    return res
      .status(200)
      .json({ success: true, message: 'Bitácora inhabilitada lógicamente.' });
  } catch (error) {
    console.error(
      `[ERROR] Controller: deleteColdRoomReport failed - ${error.message}`,
    );
    return res
      .status(500)
      .json({ success: false, message: 'Error al ejecutar baja lógica.' });
  }
};
