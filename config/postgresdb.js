import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ==========================================
// 1. CONFIGURACIÓN DE SEGURIDAD (SSL/TLS)
// ==========================================
const useSSL = process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';
const caPath = path.resolve('certs/global-bundle.pem');

// ==========================================
// 2. INSTANCIA DE SEQUELIZE
// ==========================================
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,

    // 🚩 CONFIGURACIÓN DE ZONA HORARIA (CST - Monterrey/Montemorelos)
    timezone: '-06:00',

    dialectOptions: {
      // Configuraciones para parseo nativo de fechas evitando conversión a UTC
      useUTC: false,
      dateStrings: true,
      typeCast: true,

      // Mantenemos tu configuración original de SSL intacta
      ssl: useSSL
        ? {
            require: true,
            rejectUnauthorized,
            ...(rejectUnauthorized && {
              ca: fs.readFileSync(caPath).toString(),
            }),
          }
        : false,
    },
  },
);

// ==========================================
// 3. FUNCIÓN DE CONEXIÓN E INICIALIZACIÓN
// ==========================================
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada (Maintenance API)');

    await import('../models/index.js');
    console.log('✅ Modelos sincronizados en memoria');
  } catch (error) {
    console.error('❌ Error de conexión a la BD:', error.message);
  }
};

export { sequelize };
export default connectDB;
