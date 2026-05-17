import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const Role = sequelize.define(
  'Role',
  {
    rol_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'Roles', // 🚩 Nombre exacto de la tabla
    paranoid: true,
    timestamps: true,
    // 🛡️ EL BLINDAJE ABSOLUTO
    sync: { force: false, alter: false },
  },
);

export default Role;
