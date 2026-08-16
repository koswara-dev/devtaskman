import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { initDB } from './db/db';
import { swaggerSpec } from './docs/swagger';

// Routes Imports
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import resetRoutes from './routes/resetRoutes';
import statisticsRoutes from './routes/statisticsRoutes';

const app = express();
const PORT = config.PORT;

// Helmet secure headers (A05:2021 Security Misconfiguration)
app.use(helmet());

// CORS configuration (A05:2021 Security Misconfiguration)
app.use(cors({
  origin: 'http://localhost:5173', // Trust frontend client Vite app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Swagger UI ships inline <script>/<style> in its bundled HTML, so it needs a relaxed CSP.
// Scoped to /api-docs only — every other route keeps the strict default helmet() policy above.
const swaggerDocsCsp = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"]
    }
  }
});
app.use('/api-docs', swaggerDocsCsp, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Rate Limiting (A04:2021-Insecure Design & DoS prevention)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Terlahu banyak permintaan dari IP Anda, silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiter to all API v1 paths
app.use('/api/v1', apiLimiter);

// Register Route Grouping API V1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reset', resetRoutes);
app.use('/api/v1/statistics', statisticsRoutes);

// Base route checker
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected-or-fallback' });
});

// Bootstrapper
const startServer = async () => {
  // Connect to Database
  await initDB();

  app.listen(PORT, () => {
    console.log(`[Server] Secure ExpressJS + TypeScript backend running on http://localhost:${PORT}`);
    console.log(`[Server] Routes mounted on /api/v1/`);
  });
};

startServer().catch(err => {
  console.error('[Server] Failed to initialize server:', err);
});
