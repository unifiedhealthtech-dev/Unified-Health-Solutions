import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false, // set to true to see SQL in dev
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Connected to PostgreSQL via Sequelize'))
  .catch(err => console.error('❌ Unable to connect:', err));

export default sequelize;