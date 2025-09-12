// app.js
import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db.js'; // Adjust path if needed
import loginRouter from './router/loginRouter.js'; 
import inventoryRouter from './router/inventoryRouter.js';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// Middleware to parse cookies  
app.use(cookieParser());
const orginOptions = {
  origin: 'http://localhost:8080', // Adjust as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials : true, // Allow cookies
};

app.use(cors(orginOptions));
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

app.use("/api", loginRouter);
app.use("/api/inventory", inventoryRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
