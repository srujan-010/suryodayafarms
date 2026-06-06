import app from './app.js';
import prisma from './utils/db.js';
import fs from 'fs';
import path from 'path';

// Clean up default Hostinger files that might intercept passenger requests
const filesToClean = ['default.html', 'index.html', 'index.php'];
filesToClean.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Removed Hostinger default file: ${filePath}`);
    } catch (err) {
      console.error(`Failed to remove ${file}:`, err.message);
    }
  }
});

const PORT = process.env.PORT || 3000;

// Verify database connection on startup
prisma.$connect()
  .then(() => {
    console.log("Database connected successfully");
    console.log("MongoDB connected"); // Log exactly what is requested
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server started`);
});

// Capture fatal promise errors and crash safely
process.on('unhandledRejection', (err) => {
  console.error(`[Fatal Server Error] Unhandled Promise Rejection: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  server.close(() => process.exit(1));
});
