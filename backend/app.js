// app.js
import express from 'express';
import dotenv from 'dotenv';
import sequelize from '../database/db.js'; // Adjust path if needed
import distributorLoginRouter from './distributor/router/distributorLoginRouter.js';
import distributorInventoryRouter from './distributor/router/distributorInventoryRouter.js';
import retailerLoginRouter from './retailer/router/retailerLoginRouter.js';
import distributorConnectionsRouter from './distributor/router/distributorConnectionRouter.js';
import retailerConnectionsRouter from './retailer/router/retailerConnectionRouter.js';
import distributorPartyRouter from './distributor/router/distributorPartyRouter.js';
import distributorNotificationRouter from './distributor/router/distributorNotificationRouter.js';
import retailerNotificationRouter from './retailer/router/retailerNotificationRouter.js';


import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ Middleware ------------------
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ------------------ HTTP + Socket.IO ------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinNotifications', ({ user_id, role }) => {
    const room = `${role}_${user_id}`;
    socket.join(room);
    console.log(`👤 User ${user_id} (${role}) joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ------------------ Routes ------------------
// Distributor routes
app.use('/api/distributor', distributorLoginRouter);
app.use('/api/distributor/inventory', distributorInventoryRouter);
app.use('/api/distributor/connections', distributorConnectionsRouter);
app.use('/api/distributor/parties', distributorPartyRouter);
app.use("/api/distributor/notifications", distributorNotificationRouter);

// Retailer routes
app.use('/api/retailer', retailerLoginRouter);
app.use('/api/retailer/connections', retailerConnectionsRouter);
app.use("/api/retailer/notifications", retailerNotificationRouter);

// ------------------ Global error handler ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ------------------ Database & Server ------------------
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
};

startServer();

// ------------------ Graceful shutdown ------------------
const shutdown = async () => {
  console.log('\n🔌 Shutting down gracefully...');
  await sequelize.close();
  server.close(() => {
    console.log('🛑 Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
