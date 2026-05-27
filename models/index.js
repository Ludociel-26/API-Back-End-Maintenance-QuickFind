import { sequelize } from '../config/postgresdb.js';

// --- INYECCIÓN DE MODELOS ---
import Inspection from './Inspection.js';
import InspectionTask from './InspectionTask.js';
import User from './User.js';
import Role from './Role.js';
import LevelArea from './LevelArea.js';
import DocumentConfig from './DocumentConfig.js';
import ChemicalDailyLog from './ChemicalDailyLog.js';
import ChemicalReading from './ChemicalReading.js';
import CongeladosDailyLog from './CongeladosDailyLog.js';
import CongeladosDailyTask from './CongeladosDailyTask.js';
import CentralVaporDailyLog from './CentralVaporDailyLog.js';
import CentralVaporReading from './CentralVaporReading.js';
import CompressorDailyLog from './CompressorDailyLog.js';
import CompressorReading from './CompressorReading.js';
import ColdRoomDailyLog from './ColdRoomDailyLog.js';
import ColdRoomReading from './ColdRoomReading.js';

// =======================================================================
// SECCIÓN 1: RELACIONES (MAESTRO - DETALLE)
// =======================================================================
Inspection.hasMany(InspectionTask, {
  foreignKey: 'inspectionId',
  as: 'tasks',
  onDelete: 'CASCADE',
});
InspectionTask.belongsTo(Inspection, { foreignKey: 'inspectionId' });

ChemicalDailyLog.hasMany(ChemicalReading, {
  foreignKey: 'logId',
  as: 'readings',
  onDelete: 'CASCADE',
});
ChemicalReading.belongsTo(ChemicalDailyLog, { foreignKey: 'logId' });

CongeladosDailyLog.hasMany(CongeladosDailyTask, {
  foreignKey: 'logId',
  as: 'tasks',
  onDelete: 'CASCADE',
});
CongeladosDailyTask.belongsTo(CongeladosDailyLog, { foreignKey: 'logId' });

CentralVaporDailyLog.hasMany(CentralVaporReading, {
  foreignKey: 'logId',
  as: 'readings',
  onDelete: 'CASCADE',
});
CentralVaporReading.belongsTo(CentralVaporDailyLog, { foreignKey: 'logId' });

CompressorDailyLog.hasMany(CompressorReading, {
  foreignKey: 'logId',
  as: 'readings',
  onDelete: 'CASCADE',
});
CompressorReading.belongsTo(CompressorDailyLog, { foreignKey: 'logId' });

ColdRoomDailyLog.hasMany(ColdRoomReading, {
  foreignKey: 'logId',
  as: 'readings',
  onDelete: 'CASCADE',
});
ColdRoomReading.belongsTo(ColdRoomDailyLog, { foreignKey: 'logId' });

// =======================================================================
// SECCIÓN 2: FIRMAS Y RESPONSABLES
// =======================================================================
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

const bindUserSignatures = (Model) => {
  Model.belongsTo(User, {
    foreignKey: 'operatorA_id',
    as: 'operatorA',
    constraints: false,
  });
  Model.belongsTo(User, {
    foreignKey: 'operatorB_id',
    as: 'operatorB',
    constraints: false,
  });
  Model.belongsTo(User, {
    foreignKey: 'operatorC_id',
    as: 'operatorC',
    constraints: false,
  });
};

bindUserSignatures(ChemicalDailyLog);
ChemicalDailyLog.belongsTo(User, {
  foreignKey: 'supervisor_id',
  as: 'supervisor',
  constraints: false,
});
ChemicalReading.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

bindUserSignatures(CongeladosDailyLog);
CongeladosDailyTask.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

bindUserSignatures(CentralVaporDailyLog);
CentralVaporReading.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

bindUserSignatures(CompressorDailyLog);
CompressorReading.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

bindUserSignatures(ColdRoomDailyLog);
ColdRoomReading.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator',
  constraints: false,
});

// =======================================================================
// SECCIÓN 3: ROLES Y ÁREAS
// =======================================================================
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

// =======================================================================
// SECCIÓN 4: INICIALIZACIÓN (ESTÁNDAR DE PRODUCCIÓN AWS/ENTERPRISE)
// =======================================================================
const initDatabase = async () => {
  try {
    const ghostIndexes = [
      'inspection_tasks_inspection_id',
      'inspection_tasks_inspectionId',
      'chemical_readings_log_id',
      'congelados_daily_tasks_log_id',
      'central_vapor_readings_log_id',
      'compressor_readings_log_id',
      'cold_room_readings_log_id',
    ];

    // Limpieza silenciosa previa a la sincronización
    for (const index of ghostIndexes) {
      await sequelize
        .query(`DROP INDEX IF EXISTS "${index}" CASCADE;`, { logging: false })
        .catch(() => null);
    }

    // Sincronización del ORM
    await sequelize.sync({ logging: false });

    console.log('[OK] Database: System models synchronized successfully.');
  } catch (error) {
    const pgCode = error.parent ? error.parent.code : null;

    // 42P07: relation already exists | 23505: unique violation | 42710: duplicate object
    if (pgCode === '42P07' || pgCode === '23505' || pgCode === '42710') {
      console.log('[OK] Database: System models verified and ready.');
    } else {
      console.error(
        `[FATAL] Database: Synchronization failed - ${error.message}`,
      );
    }
  }
};

initDatabase();

export {
  Inspection,
  InspectionTask,
  User,
  Role,
  LevelArea,
  DocumentConfig,
  ChemicalDailyLog,
  ChemicalReading,
  CongeladosDailyLog,
  CongeladosDailyTask,
  CentralVaporDailyLog,
  CentralVaporReading,
  CompressorDailyLog,
  CompressorReading,
  ColdRoomDailyLog,
  ColdRoomReading,
};
