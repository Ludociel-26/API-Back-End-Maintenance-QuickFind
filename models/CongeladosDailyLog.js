import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CongeladosDailyLog = sequelize.define(
  'CongeladosDailyLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🚩 FECHA DE PRODUCCIÓN (El "Día" que agrupa los 3 turnos)
    productionDate: { type: DataTypes.DATEONLY, allowNull: false },

    // Limpieza y Observaciones Generales
    observaciones_generales: { type: DataTypes.TEXT, defaultValue: '' },
    limpieza_completada: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Firmas de los operadores por turno
    operatorA_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorB_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorC_id: { type: DataTypes.INTEGER, allowNull: true },

    // Datos del pie de hoja (SGC)
    codigo_documento: { type: DataTypes.STRING },
    version: { type: DataTypes.STRING },
    fecha_revision: { type: DataTypes.STRING },
    fecha_reemplazo: { type: DataTypes.STRING },
    propietario: { type: DataTypes.STRING },
    aprobador: { type: DataTypes.STRING },
    estandar_calidad: { type: DataTypes.STRING },
    razon_cambio: { type: DataTypes.STRING },

    // Soft Delete
    activo: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  {
    tableName: 'congelados_daily_logs', // 🚩 Tabla exclusiva en SQL
    timestamps: true,
  },
);

export default CongeladosDailyLog;
