import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

// Authenticate connection
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL'))
  .catch((err) => console.error('Error connecting to MySQL:', err));


  export { sequelize };

