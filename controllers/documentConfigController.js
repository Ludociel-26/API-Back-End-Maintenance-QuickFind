import DocumentConfig from '../models/DocumentConfig.js';
import logger from '../logger.js';

// GET: Obtener las configuraciones de todas las áreas
export const getAllConfigs = async (req, res) => {
  try {
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
      {
        area_key: 'analisis_quimicos_vapor',
        codigo_documento: '2.2-16-3-6',
        version: '4.0',
        fecha_revision: 'Mayo/29/25',
        fecha_reemplazo: 'Mayo/15/24',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel Gonzalez',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio:
          'Cambio de Aprobador y propietario. Se eliminan registros de sulfitos.',
      },
      {
        area_key: 'reportes_diarios_congelados',
        codigo_documento: '2.2-16-3-11',
        version: '3.0',
        fecha_revision: 'Febrero/23/2026',
        fecha_reemplazo: 'Agosto/29/25',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel Gonzalez',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio:
          'Se eliminó suavizador. Se agregó torre PROTEC, detección/fugas de amoniaco.',
      },
      {
        area_key: 'central_vapor_bitacora',
        codigo_documento: '2.2-16-3-7',
        version: '4.0',
        fecha_revision: 'Abril/18/2024',
        fecha_reemplazo: 'Enero/25/2025',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel Gonzalez',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio:
          'Revisión de nivel de combustóleo principal y rangos de operación.',
      },
      {
        area_key: 'bitacora_compresor_aire',
        codigo_documento: '2.2-16-3-8',
        version: '3.0',
        fecha_revision: 'Mayo/15/24',
        fecha_reemplazo: 'Mayo/11/22',
        propietario: 'Fernando Gaxiola',
        aprobador: 'Gabriel Gonzalez',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio: 'Actualización de formato de bitácora de compresores.',
      },
      {
        area_key: 'bitacora_cuarto_frio_5',
        codigo_documento: '2.2-16-3-16',
        version: '3.0',
        fecha_revision: 'Abril/25/24',
        fecha_reemplazo: 'Mayo/12/22',
        propietario: 'Jonathan Serrato',
        aprobador: 'Gabriel Gonzalez',
        estandar_calidad: 'Mantenimiento Preventivo',
        razon_cambio: 'Cambio de Aprobador y propietario',
      },
    ];

    // 🚩 SOLUCIÓN ENTERPRISE: Bypasseamos el findOrCreate para evitar el bug de Sequelize
    for (const conf of defaultConfigs) {
      const existingConfig = await DocumentConfig.findByPk(conf.area_key);

      // Si no existe, lo creamos directamente. Silencio absoluto en consola.
      if (!existingConfig) {
        await DocumentConfig.create(conf);
      }
    }

    const configs = await DocumentConfig.findAll();
    return res.status(200).json({ success: true, data: configs });
  } catch (error) {
    logger.error(`[ERROR] Controller: getAllConfigs failed - ${error.message}`);
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
    return res.status(200).json({
      success: true,
      message: 'Formato actualizado exitosamente.',
      data: config,
    });
  } catch (error) {
    logger.error(`[ERROR] Controller: updateConfig failed - ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno al guardar los cambios en la BD.',
    });
  }
};
