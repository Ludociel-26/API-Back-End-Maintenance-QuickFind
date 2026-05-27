import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const DocumentConfig = sequelize.define(
  'DocumentConfig',
  {
    area_key: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false, // Garantiza que no sea nulo
    },
    codigo_documento: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    fecha_revision: { type: DataTypes.STRING, allowNull: false },
    fecha_reemplazo: { type: DataTypes.STRING, allowNull: false },
    propietario: { type: DataTypes.STRING, allowNull: false },
    aprobador: { type: DataTypes.STRING, allowNull: false },
    estandar_calidad: { type: DataTypes.STRING, allowNull: false },
    // Aumenté el tipo a TEXT por si alguna razón de cambio es muy larga
    razon_cambio: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'document_configs',
    timestamps: false,
  },
);

export default DocumentConfig;
