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
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// Middleware to parse cookies  
app.use(cookieParser());
const originOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'], // Adjust as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials : true, // Allow cookies
};

app.use(cors(originOptions));
// Serve static files


// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to PostgreSQL');

    // Start server after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1); // Exit if DB can't connect
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// distributor routes
app.use("/api/distributor", distributorLoginRouter);
app.use("/api/distributor/inventory", distributorInventoryRouter);
app.use("/api/distributor/connections", distributorConnectionsRouter);
app.use("/api/distributor/parties", distributorPartyRouter);
// retailer routes
app.use("/api/retailer", retailerLoginRouter);
app.use("/api/retailer/connections", retailerConnectionsRouter);


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
