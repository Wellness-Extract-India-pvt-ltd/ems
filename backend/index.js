import 'dotenv/config'; // Load environment variables from .env file
import mongoose from 'mongoose'; // MongoDB ODM
import app from './app.js'; // Express app instance

const PORT = process.env.PORT || 5000;

/**
 * Starts the Express server and connects to MongoDB.
 * Handles graceful shutdown and process-level error events.
 */
async function startServer() {
  try {
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    /**
     * Gracefully shuts down the server and closes DB connection.
     */
    const shutdown = async () => {
      console.log('🛑 Shutting down...');
      await mongoose.connection.close();
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
    // Log MongoDB connection errors and exit process
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

// Initialize the server
startServer();