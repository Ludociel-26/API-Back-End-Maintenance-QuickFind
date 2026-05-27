import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CompressorDailyLog = sequelize.define(
  'CompressorDailyLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    observaciones: { type: DataTypes.TEXT, defaultValue: '' },
    // ... (tus otros campos horas_1, horas_2, etc)
    operatorA_id: { type: DataTypes.INTEGER },
    operatorB_id: { type: DataTypes.INTEGER },
    operatorC_id: { type: DataTypes.INTEGER },
    // 🚩 ESTA ES LA COLUMNA QUE FALTA
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    codigo_documento: { type: DataTypes.STRING },
    version: { type: DataTypes.STRING },
    fecha_revision: { type: DataTypes.STRING },
    fecha_reemplazo: { type: DataTypes.STRING },
    propietario: { type: DataTypes.STRING },
    aprobador: { type: DataTypes.STRING },
    estandar_calidad: { type: DataTypes.STRING },
    razon_cambio: { type: DataTypes.TEXT },
  },
  {
    tableName: 'compressor_daily_logs',
    timestamps: true,
  },
);

export default CompressorDailyLog;
