import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const LevelArea = sequelize.define(
  'levelArea',
  {
    area_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    level: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: true },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#fcfcfc',
    },
  },
  {
    tableName: 'levelAreas', // 🚩 Nombre exacto de la tabla
    paranoid: true,
    timestamps: true,
    // 🛡️ EL BLINDAJE ABSOLUTO
    sync: { force: false, alter: false },
  },
);

export default LevelArea;
