import DocumentConfig from '../models/DocumentConfig.js';
import logger from '../logger.js';

// GET: Obtener las configuraciones de todas las áreas
export const getAllConfigs = async (req, res) => {
  try {
    // 🛡️ PATRÓN SELF-HEALING ROBUSTO: Definimos todas las plantillas maestras obligatorias
    const defaultConfigs = [
      {
        area_key: 'ref',
        codigo_documento: '2.2-16-3-50',
        version: '3.0',
        fecha_revision: 'Mayo/15/24',
        fecha_reemplazo: 'Mayo/11/22',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel González',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio: 'Cambio de aprobador, propietario y logo',
      },
      {
        area_key: 'conge',
        codigo_documento: '2.2-16-3-51',
        version: '3.0',
        fecha_revision: 'Mayo/15/24',
        fecha_reemplazo: 'Mayo/11/22',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel González',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio: 'Cambio de aprobador, propietario y logo',
      },
      // 🚩 NUEVA PLANTILLA: Análisis Químicos (Datos extraídos de tu foto real)
      {
        area_key: 'analisis_quimicos_vapor',
        codigo_documento: '2.2-16-3-6',
        version: '4.0',
        fecha_revision: 'Mayo/29/25',
        fecha_reemplazo: 'Mayo/15/24',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel Gonzalez', // Sin acento, tal como en tu documento
        estandar_calidad: 'Mantenimiento Preventivo', // Asumido por el estándar de Mantenimiento
        razon_cambio:
          'Cambio de Aprobador y de propietario, Se eliminan de esta bitácora los registros de sulfitos, Cont. Neutralizada, alcalinidad y trasar.',
      },
    ];

    // Recorremos las configuraciones maestras y las inyectamos si no existen
    for (const conf of defaultConfigs) {
      await DocumentConfig.findOrCreate({
        where: { area_key: conf.area_key },
        defaults: conf,
      });
    }

    // Leemos todos los registros ya con la certeza de que los 3 formatos existen
    const configs = await DocumentConfig.findAll();

    return res.status(200).json({ success: true, data: configs });
  } catch (error) {
    logger.error(`Error obteniendo configuraciones ISO: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones de calidad.',
    });
  }
};

// PUT: Actualizar configuración
export const updateConfig = async (req, res) => {
  try {
    const { area_key } = req.params;
    const configData = req.body;

    const config = await DocumentConfig.findByPk(area_key);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'El área especificada no está configurada.',
      });
    }

    await config.update(configData);

    logger.info(`Cambio Normativo ISO aprobado para el área: ${area_key}`);
    return res.status(200).json({
      success: true,
      message: 'Formato actualizado exitosamente.',
      data: config,
    });
  } catch (error) {
    logger.error(`Error actualizando configuración ISO: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno al guardar los cambios en la BD.',
    });
  }
};
