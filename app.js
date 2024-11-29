import express from 'express';
import session from 'express-session';
import connectSessionSequelize from 'connect-session-sequelize';
const SequelizeStore = connectSessionSequelize(session.Store); // Access SequelizeStore
import { sequelize } from './models/sequelize.js'; // Sequelize instance
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config.js'; // Swagger configuration file

// Initialize dotenv
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Session Store Configuration
const sessionStore = new SequelizeStore({ db: sequelize });

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for secret
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Sync the session store
sessionStore.sync();

// Middleware to log session data (for debugging, can be removed in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Session Data:', req.session); // Remove or adjust for production
  }
  next();
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Import routes
import blogRoutes from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Use routes
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
