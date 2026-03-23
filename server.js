const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./libraries/logger');

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});
