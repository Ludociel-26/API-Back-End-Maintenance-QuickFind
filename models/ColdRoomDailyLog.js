import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const ColdRoomDailyLog = sequelize.define(
  'ColdRoomDailyLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true, // 🚩 Restablecido de forma segura nativa
      comment: 'Fecha del día operativo ajustada por ventana de turnos',
    },
    observaciones: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },

    operatorA_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorB_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorC_id: { type: DataTypes.INTEGER, allowNull: true },

    codigo_documento: { type: DataTypes.STRING, defaultValue: '2.2-16-3-16' },
    version: { type: DataTypes.STRING, defaultValue: '3.0' },
    fecha_revision: { type: DataTypes.STRING },
    fecha_reemplazo: { type: DataTypes.STRING },
    propietario: { type: DataTypes.STRING },
    aprobador: { type: DataTypes.STRING },
    estandar_calidad: { type: DataTypes.STRING },
    razon_cambio: { type: DataTypes.TEXT },

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: 'cold_room_daily_logs',
    timestamps: true,
    // 🚩 BLOQUE DE INDEXES ELIMINADO PARA EVITAR EL CRASH 42P07
  },
);

export default ColdRoomDailyLog;
