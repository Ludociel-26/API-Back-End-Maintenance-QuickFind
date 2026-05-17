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

const app = express();
const port = process.env.PORT || 4001;

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      logger.warn(`Bloqueado por CORS: ${origin}`);
      return callback(new Error('Bloqueado por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-forwarded-for'],
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 🚩 Rutas de la API de Mantenimiento
app.get('/api/health', (req, res) => res.send('Maintenance API Running OK'));
app.use('/api/inspections', inspectionRoutes);

// Manejo de errores JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .json({ success: false, message: 'Formato JSON inválido' });
  }
  next();
});

// Ruta no encontrada
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

const startServer = async () => {
  try {
    await connectDB();

    // IMPORTANTE: En desarrollo está bien usar alter: true para que las tablas se creen solas,
    // en producción debes usar un sistema de migraciones.
    await sequelize.sync();

    app.listen(port, () => {
      logger.info(`🚀 Maintenance Server started on PORT:${port}`);
    });
  } catch (error) {
    logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();
