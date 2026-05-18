import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const ChemicalDailyLog = sequelize.define(
  'ChemicalDailyLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assetId: {
      type: DataTypes.STRING,
      defaultValue: 'analisis_quimicos_vapor',
      allowNull: false,
    },

    // 🚩 FECHA DE PRODUCCIÓN (Si la lectura es 2AM, pertenece a la fecha de ayer)
    productionDate: { type: DataTypes.DATEONLY, allowNull: false },

    // 🚩 FIRMAS DE LOS OPERADORES POR TURNO
    operatorA_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorB_id: { type: DataTypes.INTEGER, allowNull: true },
    operatorC_id: { type: DataTypes.INTEGER, allowNull: true },
    supervisor_id: { type: DataTypes.INTEGER, allowNull: true },

    // 🚩 DATOS DEL PIE DE HOJA (SGC)
    codigo_documento: { type: DataTypes.STRING },
    version: { type: DataTypes.STRING },
    fecha_revision: { type: DataTypes.STRING },
    fecha_reemplazo: { type: DataTypes.STRING },
    propietario: { type: DataTypes.STRING },
    aprobador: { type: DataTypes.STRING },
    estandar_calidad: { type: DataTypes.STRING },
    razon_cambio: { type: DataTypes.STRING },

    // 🚩 SOFT DELETE
    activo: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  {
    tableName: 'chemical_daily_logs',
    timestamps: true,
  },
);

export default ChemicalDailyLog;
