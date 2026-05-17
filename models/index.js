import Inspection from './Inspection.js';
import InspectionTask from './InspectionTask.js';
import User from './User.js';
import Role from './Role.js';
import LevelArea from './LevelArea.js';

// ==========================================
// 1. RELACIONES INTERNAS (MANTENIMIENTO)
// ==========================================
Inspection.hasMany(InspectionTask, {
  foreignKey: 'inspectionId',
  as: 'tasks',
  onDelete: 'CASCADE',
});
InspectionTask.belongsTo(Inspection, {
  foreignKey: 'inspectionId',
});

// ==========================================
// 2. RELACIONES EXTERNAS (MODELOS PROXY)
// ==========================================
// Inspección -> Usuarios
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

export { Inspection, InspectionTask, User, Role, LevelArea };
