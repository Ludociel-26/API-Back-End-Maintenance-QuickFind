import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const InspectionTask = sequelize.define(
  'InspectionTask',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    inspectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valueString: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAnomaly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'inspection_tasks',
    timestamps: false,
    indexes: [{ fields: ['inspectionId'] }],
  },
);

export default InspectionTask;
