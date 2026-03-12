import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointments.js';
import enquiryRoutes from './routes/enquiry.js';
import authRoutes from './routes/auth.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors()); // Allow all origins initially for easier deployment
app.use(express.json());

app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CC Beauty API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
