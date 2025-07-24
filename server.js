import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import http from 'http';

import appointmentRoutes from './routes/appointmentRoutes.js';

import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import connectDB from './config/mongodb.js';


const app = express();
connectDB();

const server = http.createServer(app);

app.use(cors({ origin: '*', credentials: true }));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
// 404 Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

