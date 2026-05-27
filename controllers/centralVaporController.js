import {
  CentralVaporDailyLog,
  CentralVaporReading,
  User,
} from '../models/index.js';

const getProductionDate = () => {
  const now = new Date();
  if (now.getHours() < 6) now.setDate(now.getDate() - 1);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

export const createVaporReport = async (req, res) => {
  try {
    const {
      caldera,
      turno,
      readings,
      globales,
      codigo_documento,
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    } = req.body;

    if (!turno || !caldera || !readings) {
      return res
        .status(400)
        .json({ success: false, message: 'Faltan parámetros obligatorios.' });
    }

    const currentOpId = req.user.id;
    const prodDate = getProductionDate();

    // 1. Maestro: Buscar o crear reporte por FECHA + CALDERA
    let [dailyLog] = await CentralVaporDailyLog.findOrCreate({
      where: { productionDate: prodDate, caldera },
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

    // 2. Actualizar Globales y SGC
    const logUpdates = {
      version,
      fecha_revision,
      fecha_reemplazo,
      propietario,
      aprobador,
      estandar_calidad,
      razon_cambio,
    };

    if (globales) {
      if (globales.observaciones)
        logUpdates.observaciones = globales.observaciones;
      if (globales.rev_bypass) logUpdates.rev_bypass = globales.rev_bypass;
      if (globales.nivel_combustoleo_prin)
        logUpdates.nivel_combustoleo_prin = globales.nivel_combustoleo_prin;
      if (globales.consumo_agua)
        logUpdates.consumo_agua = globales.consumo_agua;
      if (globales.total_kg_vapor)
        logUpdates.total_kg_vapor = globales.total_kg_vapor;
      if (globales.sal) logUpdates.sal = globales.sal;
      if (globales.diesel) logUpdates.diesel = globales.diesel;
    }

    if (turno === 'A') logUpdates.operatorA_id = currentOpId;
    if (turno === 'B') logUpdates.operatorB_id = currentOpId;
    if (turno === 'C') logUpdates.operatorC_id = currentOpId;

    await dailyLog.update(logUpdates);

    // 3. Detalle: Upsert de Lecturas (Renglones)
    const readingPromises = readings.map(async (readData) => {
      const { hora, ...metrics } = readData;

      let reading = await CentralVaporReading.findOne({
        where: { logId: dailyLog.id, hora },
      });

      if (reading) {
        // Solo actualizamos si el que edita es del mismo turno, o si estamos sobreescribiendo
        return reading.update({ ...metrics, turno, operatorId: currentOpId });
      } else {
        return CentralVaporReading.create({
          logId: dailyLog.id,
          hora,
          turno,
          ...metrics,
          operatorId: currentOpId,
        });
      }
    });

    await Promise.all(readingPromises);

    return res
      .status(201)
      .json({
        success: true,
        message: `Lecturas guardadas para ${caldera} (Turno ${turno}).`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error interno en el servidor.' });
  }
};

export const getVaporHistory = async (req, res) => {
  try {
    const logs = await CentralVaporDailyLog.findAll({
      where: { activo: true },
      order: [['productionDate', 'DESC']],
      limit: 100,
      include: [
        {
          model: CentralVaporReading,
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
    return res
      .status(500)
      .json({ success: false, message: 'Error al recuperar el historial.' });
  }
};

export const deleteVaporReport = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await CentralVaporDailyLog.findByPk(id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: 'Bitácora no encontrada.' });

    await record.update({ activo: false });
    return res
      .status(200)
      .json({ success: true, message: 'Bitácora eliminada.' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error lógico en BD.' });
  }
};
