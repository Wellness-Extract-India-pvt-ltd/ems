// app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js'; // Main router for all API endpoints

const app = express();

/**
 * Middleware setup
 */

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow frontend URL or all origins
  credentials: true, // Allow cookies to be sent
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Parse cookies from the HTTP Request
app.use(cookieParser());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add security-related HTTP headers
app.use(helmet());

// HTTP request logger middleware for node.js
app.use(morgan('dev'));

/**
 * Mount API routes
 * All API endpoints are prefixed with /api/v1
 */
app.use('/api/v1', routes);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EMS backend is healthy' });
});

/**
 * 404 handler for unknown routes
 */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

/**
 * Global error handler
 * Catches errors thrown in routes/middleware
 */
app.use((err, req, res, next) => {
  // Log the error stack for debugging (avoid exposing in production)
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;