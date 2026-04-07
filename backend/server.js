import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Routes
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import enquiryRoutes from './routes/enquiry.js';
import authRoutes from './routes/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

if (process.env.MONGO_URI) {
  console.log(' MONGO_URI loaded from .env:', process.env.MONGO_URI.substring(0, 20) + '...');
} else {
  console.error(' MONGO_URI NOT FOUND in process.env');
}

connectDB();

const app = express();

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
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
