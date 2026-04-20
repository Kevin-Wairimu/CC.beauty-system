import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import enquiryRoutes from './routes/enquiry.js';
import authRoutes from './routes/auth.js';
import { initScheduler } from './utils/scheduler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL NOT FOUND in process.env");
}

// Database & Scheduler
connectDB();
initScheduler();

const app = express();

// Trust proxy for Render/Cloudflare
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet()); 
app.use(compression()); 

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cc-beauty-system.pages.dev',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.pages.dev');
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Policy restriction'), false);
    }
  }
}));

app.use(express.json());

// API Routes
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CC Beauty API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
