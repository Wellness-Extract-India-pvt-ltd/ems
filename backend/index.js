import 'dotenv/config'; // Load environment variables from .env file
import { testConnection, syncDatabase, closeConnection } from './database/connection.js';
import models from './models/index.js'; // Import all models to set up associations
import app from './app.js'; // Express app instance

const PORT = process.env.PORT || 5000;

/**
 * Starts the Express server and connects to MySQL.
 * Handles graceful shutdown and process-level error events.
 */
async function startServer() {
  try {
    // Test MySQL connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to MySQL database');
    }

    // Sync database (create tables if they don't exist)
    const isSynced = await syncDatabase(false); // Set to true to force recreate tables
    if (!isSynced) {
      throw new Error('Failed to sync database');
    }

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    /**
     * Gracefully shuts down the server and closes DB connection.
     */
    const shutdown = async () => {
      console.log('🛑 Shutting down...');
      await closeConnection();
      server.close(() => {
        console.log('🔌 Server closed. DB disconnected.');
        process.exit(0);
      });
    };

    // Listen for termination signals to gracefully shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });
  } catch (err) {
    // Log MySQL connection errors and exit process
    console.error('❌ MySQL Connection Error:', err.message);
    process.exit(1);
  }
}

// Initialize the server
startServer();