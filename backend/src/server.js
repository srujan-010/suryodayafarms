import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SURYODAYA FARMS - FULL-STACK PREMIUM E-COMMERCE API  `);
  console.log(`  Running on Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

// Capture fatal promise errors and crash safely
process.on('unhandledRejection', (err) => {
  console.error(`[Fatal Server Error] Unhandled Promise Rejection: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  server.close(() => process.exit(1));
});
