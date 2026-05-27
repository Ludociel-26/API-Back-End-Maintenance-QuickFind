import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CentralVaporDailyLog = sequelize.define(
  'CentralVaporDailyLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    productionDate: { type: DataTypes.DATEONLY, allowNull: false },
    caldera: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General',
    }, // Ej. Caldera 1, Caldera 2

    // Datos Globales del Fondo de la Hoja
    observaciones: { type: DataTypes.TEXT, defaultValue: '' },
    rev_bypass: { type: DataTypes.STRING, defaultValue: '' },
    nivel_combustoleo_prin: { type: DataTypes.STRING, defaultValue: '' },

    // Consumos
    consumo_agua: { type: DataTypes.STRING, defaultValue: '' },
    total_kg_vapor: { type: DataTypes.STRING, defaultValue: '' },
    sal: { type: DataTypes.STRING, defaultValue: '' },
    diesel: { type: DataTypes.STRING, defaultValue: '' },

    // Firmas
    operatorA_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorB_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorC_id: { type: DataTypes.INTEGER, allowNull: true },

    // SGC
    codigo_documento: { type: DataTypes.STRING },
    version: { type: DataTypes.STRING },
    fecha_revision: { type: DataTypes.STRING },
    fecha_reemplazo: { type: DataTypes.STRING },
    propietario: { type: DataTypes.STRING },
    aprobador: { type: DataTypes.STRING },
    estandar_calidad: { type: DataTypes.STRING },
    razon_cambio: { type: DataTypes.TEXT },

    activo: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  {
    tableName: 'central_vapor_daily_logs',
    timestamps: true,
  },
);

export default CentralVaporDailyLog;
