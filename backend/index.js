import 'dotenv/config'; // Load environment variables from .env file
import mongoose from 'mongoose'; // MongoDB ODM
import app from './app.js'; // Express app instance
import redisConfig from './config/redis.js'; // Redis configuration

const PORT = process.env.PORT || 5000;

/**
 * Starts the Express server and connects to MongoDB.
 * Handles graceful shutdown and process-level error events.
 */
async function startServer() {
  try {
<<<<<<< Updated upstream
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
=======
    // Test MySQL connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to MySQL database');
    }

    // Initialize Redis connection
    try {
      await redisConfig.connect();
      console.log('✅ Redis Connected successfully');
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed, continuing without cache:', redisError.message);
    }
>>>>>>> Stashed changes

    // Skip database sync since tables already exist
    // const isSynced = await syncDatabase(false); // Set to true to force recreate tables
    // if (!isSynced) {
    //   throw new Error('Failed to sync database');
    // }

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    /**
     * Gracefully shuts down the server and closes DB connection.
     */
    const shutdown = async () => {
      console.log('🛑 Shutting down...');
<<<<<<< Updated upstream
      await mongoose.connection.close();
=======
      await closeConnection();
      await redisConfig.disconnect();
>>>>>>> Stashed changes
      server.close(() => {
        console.log('🔌 Server closed. DB and Redis disconnected.');
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
    // Log MongoDB connection errors and exit process
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

// Initialize the server
startServer();