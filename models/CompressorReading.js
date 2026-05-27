import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CompressorReading = sequelize.define(
  'CompressorReading',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    logId: { type: DataTypes.INTEGER, allowNull: false },
    hora: { type: DataTypes.STRING, allowNull: false }, // Ej. "06:00", "08:00"
    turno: { type: DataTypes.STRING, allowNull: false },

    // Temperaturas (1 al 7, Sull, GD)
    temp_lec_1: { type: DataTypes.STRING },
    temp_lec_2: { type: DataTypes.STRING },
    temp_lec_3: { type: DataTypes.STRING },
    temp_lec_4: { type: DataTypes.STRING },
    temp_lec_5: { type: DataTypes.STRING },
    temp_lec_6: { type: DataTypes.STRING },
    temp_lec_7: { type: DataTypes.STRING },
    temp_sull: { type: DataTypes.STRING },
    temp_gd: { type: DataTypes.STRING },

    // Presiones (1 al 7, Sull, GD)
    pres_lec_1: { type: DataTypes.STRING },
    pres_lec_2: { type: DataTypes.STRING },
    pres_lec_3: { type: DataTypes.STRING },
    pres_lec_4: { type: DataTypes.STRING },
    pres_lec_5: { type: DataTypes.STRING },
    pres_lec_6: { type: DataTypes.STRING },
    pres_lec_7: { type: DataTypes.STRING },
    pres_sull: { type: DataTypes.STRING },
    pres_gd: { type: DataTypes.STRING },

    // Validaciones
    fuga_aire: { type: DataTypes.STRING },
    fuga_aceite: { type: DataTypes.STRING },
    ruido_extrano: { type: DataTypes.STRING },
    purga_test: { type: DataTypes.STRING },
    mirilla_filtro: { type: DataTypes.STRING },

    operatorId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'compressor_readings',
    timestamps: true,
  },
);

export default CompressorReading;
