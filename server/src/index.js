import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import stakeholderRoutes from './routes/stakeholders.js';
import projectRoutes from './routes/projects.js';
import activityRoutes from './routes/activities.js';
import healthRoutes from './routes/healthScores.js';
import surveyRoutes from './routes/surveys.js';
import surveyResponseRoutes from './routes/surveyResponses.js';
import dashboardRoutes from './routes/dashboard.js';
import activityLogRoutes from './routes/activityLog.js';
import userRoutes from './routes/users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware);
app.use('/api/accounts', accountRoutes);
app.use('/api/accounts', stakeholderRoutes);
app.use('/api/accounts', projectRoutes);
app.use('/api/accounts', activityRoutes);
app.use('/api/accounts', healthRoutes);
app.use('/api/accounts', surveyResponseRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

// Serve client build in production
if (env.NODE_ENV === 'production') {
  const clientDist = resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(resolve(clientDist, 'index.html'));
  });
}

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`CS360 API running on http://localhost:${env.PORT}`);
});
