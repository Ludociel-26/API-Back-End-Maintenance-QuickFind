import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const DocumentConfig = sequelize.define(
  'DocumentConfig',
  {
    area_key: {
      type: DataTypes.STRING,
      primaryKey: true, // 'ref' o 'conge'
    },
    codigo_documento: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    fecha_revision: { type: DataTypes.STRING, allowNull: false },
    fecha_reemplazo: { type: DataTypes.STRING, allowNull: false },
    propietario: { type: DataTypes.STRING, allowNull: false },
    aprobador: { type: DataTypes.STRING, allowNull: false },
    estandar_calidad: { type: DataTypes.STRING, allowNull: false },
    razon_cambio: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'document_configs',
    timestamps: false,
  },
);

export default DocumentConfig;
