import { sequelize } from '../config/postgresdb.js';

import Inspection from './Inspection.js';
import InspectionTask from './InspectionTask.js';
import User from './User.js';
import Role from './Role.js';
import LevelArea from './LevelArea.js';
import DocumentConfig from './DocumentConfig.js';

// 🚩 1. IMPORTAMOS LOS NUEVOS MODELOS MAESTRO-DETALLE
import ChemicalDailyLog from './ChemicalDailyLog.js';
import ChemicalReading from './ChemicalReading.js';

// ==========================================
// 1. RELACIONES INTERNAS (PRE-OPERATIVOS)
// ==========================================
Inspection.hasMany(InspectionTask, {
  foreignKey: 'inspectionId',
  as: 'tasks',
  onDelete: 'CASCADE',
});
InspectionTask.belongsTo(Inspection, { foreignKey: 'inspectionId' });

// ==========================================
// 2. RELACIONES INTERNAS (ANÁLISIS QUÍMICOS)
// ==========================================
ChemicalDailyLog.hasMany(ChemicalReading, {
  foreignKey: 'logId',
  as: 'readings',
  onDelete: 'CASCADE',
});
ChemicalReading.belongsTo(ChemicalDailyLog, { foreignKey: 'logId' });

// ==========================================
// 3. RELACIONES EXTERNAS A USUARIOS (FIRMAS Y OPERADORES)
// ==========================================
// Pre-Operativos -> Usuarios
Inspection.belongsTo(User, {
  foreignKey: 'userId',
  as: 'operator',
  constraints: false,
});
Inspection.belongsTo(User, {
  foreignKey: 'supervisorId',
  as: 'supervisor',
  constraints: false,
});

// Bitácora Química Maestra -> Firmas de Turno
ChemicalDailyLog.belongsTo(User, {
  foreignKey: 'operatorA_id',
  as: 'operatorA',
  constraints: false,
});
ChemicalDailyLog.belongsTo(User, {
  foreignKey: 'operatorB_id',
  as: 'operatorB',
  constraints: false,
});
ChemicalDailyLog.belongsTo(User, {
  foreignKey: 'operatorC_id',
  as: 'operatorC',
  constraints: false,
});
ChemicalDailyLog.belongsTo(User, {
  foreignKey: 'supervisor_id',
  as: 'supervisor',
  constraints: false,
});

// Renglón de Análisis Químico -> Operador que lo hizo
ChemicalReading.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

// Usuario -> Roles y Áreas
User.belongsTo(Role, {
  foreignKey: 'rol_id',
  as: 'roleData',
  constraints: false,
});
User.belongsTo(LevelArea, {
  foreignKey: 'area_id',
  as: 'areaData',
  constraints: false,
});

// ==========================================
// 4. SINCRONIZACIÓN DE LA BD
// ==========================================
sequelize
  .sync({ alter: true })
  .then(() =>
    console.log('✅ Modelos sincronizados con la Base de Datos correctamente.'),
  )
  .catch((err) => console.error('❌ Error al sincronizar modelos:', err));

// 🚩 2. EXPORTAMOS LOS MODELOS PARA LOS CONTROLADORES
export {
  Inspection,
  InspectionTask,
  User,
  Role,
  LevelArea,
  DocumentConfig,
  ChemicalDailyLog,
  ChemicalReading,
};
