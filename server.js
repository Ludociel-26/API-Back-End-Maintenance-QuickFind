import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import connectDB, { sequelize } from './config/postgresdb.js';
import logger from './logger.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chemicalAnalysisRoutes from './routes/chemicalAnalysisRoutes.js';
import congeladosReportRoutes from './routes/congeladosReportRoutes.js';
import centralVaporRoutes from './routes/centralVaporRoutes.js';
import compressorRoutes from './routes/compressorRoutes.js';
import coldRoomRoutes from './routes/coldRoomRoutes.js';

const app = express();
const port = process.env.PORT || 4001;

// Trust Proxy para entornos con balanceadores de carga (AWS ELB, Nginx)
app.set('trust proxy', 1);

// Seguridad HTTP
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Configuración estricta de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(
        `[WARN] Security: CORS blocked unauthorized access from origin - ${origin}`,
      );
      return callback(new Error('Bloqueado por política CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-forwarded-for'],
  }),
);

// Prevención de ataques DDoS / Fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rutas de la API (Mantenimiento)
app.get('/api/health', (req, res) =>
  res.status(200).json({ status: 'OK', service: 'Maintenance API' }),
);
app.use('/api/inspections', inspectionRoutes);
app.use('/api', documentRoutes);
app.use('/api/chemical-analysis', chemicalAnalysisRoutes);
app.use('/api/congelados-report', congeladosReportRoutes);
app.use('/api/central-vapor', centralVaporRoutes);
app.use('/api/compresores', compressorRoutes);
app.use('/api/cuarto-frio-5', coldRoomRoutes);

// Interceptor de errores de parseo JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn(
      `[WARN] Request: Invalid JSON payload received from IP - ${req.ip}`,
    );
    return res
      .status(400)
      .json({ success: false, message: 'Formato JSON inválido.' });
  }
  next();
});

// Manejador de rutas inexistentes (404)
app.use((req, res) => {
  logger.warn(
    `[WARN] Routing: Endpoint not found - ${req.method} ${req.originalUrl}`,
  );
  res
    .status(404)
    .json({ message: 'El recurso solicitado no existe en esta API.' });
});

// Inicialización del servicio
const startServer = async () => {
  try {
    // 1. Conectar a la base de datos
    await connectDB();

    // 2. Sincronización secundaria silenciosa (La orquestación principal ya ocurre en models/index.js)
    await sequelize.sync({ logging: false });

    // 3. Levantar servicio HTTP
    app.listen(port, () => {
      logger.info(
        `[OK] System: Maintenance API is actively listening on PORT ${port}`,
      );
    });
  } catch (error) {
    logger.error(
      `[FATAL] System: Server initialization failed - ${error.message}`,
    );
    process.exit(1);
  }
};

startServer();
