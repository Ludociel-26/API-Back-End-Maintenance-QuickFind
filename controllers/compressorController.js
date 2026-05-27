import {
  CompressorDailyLog,
  CompressorReading,
  User,
} from '../models/index.js';

// Calcula la fecha de producción correcta (El turno nocturno 'C' pertenece al día anterior)
const getProductionDate = (horaLectura) => {
  const now = new Date();
  const hourNum = parseInt(horaLectura.split(':')[0], 10);

  if (hourNum < 6 || hourNum === 24) {
    now.setDate(now.getDate() - 1);
  }

  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export const createCompressorReport = async (req, res) => {
  try {
    const { turno, readings, globales, metadata } = req.body;

    // Evitamos crash si la sesión/token se corrompió
    const currentOpId = req.user?.id || null;

    // Extraemos la hora para calcular la fecha del día de producción
    const horaLectura =
      readings && readings.length > 0 ? readings[0].hora : '12:00';
    const prodDate = getProductionDate(horaLectura);

    // 1. MAESTRO: Buscar o Crear la bitácora del día
    let [log] = await CompressorDailyLog.findOrCreate({
      where: { productionDate: prodDate },
      defaults: { ...metadata, productionDate: prodDate },
    });

    // 2. MAESTRO: Actualizar SGC, Consumos Finales (Globales) y Firmas
    const logUpdates = { ...metadata };

    if (globales) {
      if (globales.observaciones)
        logUpdates.observaciones = globales.observaciones;
      if (globales.horas_sull) logUpdates.horas_sull = globales.horas_sull;
      if (globales.horas_gd) logUpdates.horas_gd = globales.horas_gd;
    }

    if (turno === 'A') logUpdates.operatorA_id = currentOpId;
    if (turno === 'B') logUpdates.operatorB_id = currentOpId;
    if (turno === 'C') logUpdates.operatorC_id = currentOpId;

    await log.update(logUpdates);

    // 3. DETALLE: Guardar o Actualizar los renglones (Lecturas por Hora)
    for (const r of readings) {
      let reading = await CompressorReading.findOne({
        where: { logId: log.id, hora: r.hora },
      });

      if (reading) {
        // Si ya existe la lectura de esa hora, la sobreescribimos (Upsert manual seguro)
        await reading.update({
          ...r,
          turno,
          operatorId: currentOpId,
        });
      } else {
        // Si no existe, creamos el renglón nuevo
        await CompressorReading.create({
          ...r,
          logId: log.id,
          turno,
          operatorId: currentOpId,
        });
      }
    }

    return res
      .status(201)
      .json({ success: true, message: 'Bitácora guardada con éxito.' });
  } catch (error) {
    console.error('Error Crítico en BD de Compresores:', error);
    return res
      .status(500)
      .json({
        success: false,
        message: 'Error interno del servidor al procesar la telemetría.',
      });
  }
};

export const getCompressorHistory = async (req, res) => {
  try {
    const logs = await CompressorDailyLog.findAll({
      where: { activo: true },
      order: [['productionDate', 'DESC']],
      limit: 60, // Límite de 2 meses para no saturar memoria
      include: [
        {
          model: CompressorReading,
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
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Error al recuperar el historial.' });
  }
};

export const deleteCompressorReport = async (req, res) => {
  try {
    const record = await CompressorDailyLog.findByPk(req.params.id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: 'Registro no encontrado.' });

    // Soft delete
    await record.update({ activo: false });
    return res
      .status(200)
      .json({ success: true, message: 'Eliminado correctamente.' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error al eliminar.' });
  }
};
