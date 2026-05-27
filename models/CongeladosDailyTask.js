import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CongeladosDailyTask = sequelize.define(
  'CongeladosDailyTask',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    logId: { type: DataTypes.INTEGER, allowNull: false }, // FK hacia CongeladosDailyLog

    turno: { type: DataTypes.ENUM('A', 'B', 'C'), allowNull: false },
    taskId: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    comments: { type: DataTypes.TEXT, defaultValue: '' },
    operatorId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'congelados_daily_tasks', // 🚩 Tabla exclusiva en SQL
    timestamps: true,
  },
);

export default CongeladosDailyTask;
