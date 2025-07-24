import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import appointmentRoutes from './routes/appointmentRoutes.js';

import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import connectDB from './config/mongodb.js';
import { Doctor } from './models/Doctor.js';

const app = express();
connectDB();

const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });
const corsOptions = {
  origin: 'http://localhost:3000',  // 👈 ONLY allow your frontend
  credentials: true,                // 👈 Allow cookies or headers
};
app.use(cors(corsOptions));
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

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Doctor updates their status
  socket.on('doctorStatusUpdate', async ({ doctorId, status }) => {
    try {
      // Update in DB
      await Doctor.findByIdAndUpdate(doctorId, { status });
      // Broadcast new status to all clients
      io.emit('doctorStatusChanged', { doctorId, status });
    } catch(err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// Prevent silent crash on critical errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
