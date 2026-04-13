import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Routes
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import enquiryRoutes from './routes/enquiry.js';
import authRoutes from './routes/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL loaded");
} else {
  console.error("DATABASE_URL NOT FOUND in process.env");
  console.error(
    "Please ensure you have set DATABASE_URL in your .env file or your deployment environment variables.",
  );
}

connectDB();

const app = express();

// Trust proxy for Render/Cloudflare
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(compression()); // Compress responses

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cc-beauty-system.pages.dev',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.pages.dev');

    if (isAllowed) {
      return callback(null, true);
    } else {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  }
}));

app.use(express.json());

app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CC Beauty API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
