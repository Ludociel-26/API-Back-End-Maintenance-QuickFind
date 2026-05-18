import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const ChemicalReading = sequelize.define(
  'ChemicalReading',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    logId: { type: DataTypes.INTEGER, allowNull: false }, // Llave foránea a la hoja maestra
    turno: { type: DataTypes.ENUM('A', 'B', 'C'), allowNull: false },
    timestampHour: { type: DataTypes.STRING, allowNull: false }, // Ej. "06:00"
    resultados: { type: DataTypes.JSON, allowNull: false }, // { ph, dureza, suavizador }
    observaciones: { type: DataTypes.TEXT, defaultValue: '' },
    operatorId: { type: DataTypes.INTEGER, allowNull: false }, // Quién registró esta hora exacta
  },
  {
    tableName: 'chemical_readings',
    timestamps: true,
  },
);

export default ChemicalReading;
