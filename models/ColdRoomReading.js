import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const ColdRoomReading = sequelize.define(
  'ColdRoomReading',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    logId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'cold_room_daily_logs', key: 'id' },
    },
    hora: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Rango de 00:00 a 23:00',
    },
    turno: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Parámetros de Sala de Compresores
    nivel_refrigerante: { type: DataTypes.STRING, defaultValue: '' },
    pres_succion: { type: DataTypes.STRING, defaultValue: '' },
    pres_descarga: { type: DataTypes.STRING, defaultValue: '' },
    pct_carga: { type: DataTypes.STRING, defaultValue: '' },
    nivel_aceite: { type: DataTypes.STRING, defaultValue: 'OK' }, // "OK" o "X"

    // Temperaturas de los 8 Evaporadores (Admiten números o "D")
    evap_1: { type: DataTypes.STRING, defaultValue: '' },
    evap_2: { type: DataTypes.STRING, defaultValue: '' },
    evap_3: { type: DataTypes.STRING, defaultValue: '' },
    evap_4: { type: DataTypes.STRING, defaultValue: '' },
    evap_5: { type: DataTypes.STRING, defaultValue: '' },
    evap_6: { type: DataTypes.STRING, defaultValue: '' },
    evap_7: { type: DataTypes.STRING, defaultValue: '' },
    evap_8: { type: DataTypes.STRING, defaultValue: '' },

    // Temperaturas de Cámaras y Ambiente Exterior
    temp_ambiente: { type: DataTypes.STRING, defaultValue: '' },
    temp_cuarto_1: { type: DataTypes.STRING, defaultValue: '' },
    temp_cuarto_2: { type: DataTypes.STRING, defaultValue: '' },
    temp_cuarto_3: { type: DataTypes.STRING, defaultValue: '' },

    // Validación eléctrica de seguridad
    apagadores_encendidos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'cold_room_readings',
    timestamps: true,
  },
);

export default ColdRoomReading;
