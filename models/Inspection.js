import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const Inspection = sequelize.define(
  'Inspection',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    area: { type: DataTypes.STRING, allowNull: false },
    shift: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.BIGINT, allowNull: false },

    // --- METADATA DEL DOCUMENTO DE CALIDAD (ISO) ---
    codigo_documento: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    fecha_revision: { type: DataTypes.STRING, allowNull: false },
    fecha_reemplazo: { type: DataTypes.STRING, allowNull: false },
    propietario: { type: DataTypes.STRING, allowNull: false },
    aprobador: { type: DataTypes.STRING, allowNull: false },
    estandar_calidad: { type: DataTypes.STRING, allowNull: false },
    razon_cambio: { type: DataTypes.STRING, allowNull: true },

    status: {
      type: DataTypes.ENUM('SUBMITTED', 'APPROVED', 'REJECTED'),
      defaultValue: 'SUBMITTED',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'inspections',
    timestamps: false,
  },
);

export default Inspection;
