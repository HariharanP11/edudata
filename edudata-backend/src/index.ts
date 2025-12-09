import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

// IMPORTANT: use the Sequelize instance from models/index.js
// This ensures a single source of truth for the DB connection.
import { sequelize } from './models';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/students.routes';

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES (TS-based routers mounted under /api)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected successfully');

    // Sync DB in development (remove in production)
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();
