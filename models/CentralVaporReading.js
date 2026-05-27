import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresdb.js';

const CentralVaporReading = sequelize.define(
  'CentralVaporReading',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    logId: { type: DataTypes.INTEGER, allowNull: false },

    hora: { type: DataTypes.STRING, allowNull: false }, // Ej. "7", "8", "14"
    turno: { type: DataTypes.ENUM('A', 'B', 'C'), allowNull: false },

    // Valores de la tabla (usamos string para permitir "X", "Ok" o números)
    presion_comb: { type: DataTypes.STRING, defaultValue: '' },
    presion_vapor: { type: DataTypes.STRING, defaultValue: '' },
    lbs_aire: { type: DataTypes.STRING, defaultValue: '' },

    temp_comb: { type: DataTypes.STRING, defaultValue: '' },
    temp_dia: { type: DataTypes.STRING, defaultValue: '' },
    temp_gases: { type: DataTypes.STRING, defaultValue: '' },
    temp_agua: { type: DataTypes.STRING, defaultValue: '' },

    operacion_comb: { type: DataTypes.STRING, defaultValue: '' },
    operacion_diesel: { type: DataTypes.STRING, defaultValue: '' },

    nivel_combustoleo_dia: { type: DataTypes.STRING, defaultValue: '' },
    disp_seguridad: { type: DataTypes.STRING, defaultValue: '' },
    bomba_alim_agua: { type: DataTypes.STRING, defaultValue: '' },

    agua_suave: { type: DataTypes.STRING, defaultValue: '' },
    agua_cruda: { type: DataTypes.STRING, defaultValue: '' },
    colum_h_agua: { type: DataTypes.STRING, defaultValue: '' },
    purga_fondo: { type: DataTypes.STRING, defaultValue: '' },

    consumo_dia: { type: DataTypes.STRING, defaultValue: '' },
    consumo_tarde: { type: DataTypes.STRING, defaultValue: '' },
    consumo_noche: { type: DataTypes.STRING, defaultValue: '' },
    consumo_total: { type: DataTypes.STRING, defaultValue: '' },

    operatorId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'central_vapor_readings',
    timestamps: true,
  },
);

export default CentralVaporReading;
