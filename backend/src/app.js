import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.get("/products", (req, res) => {
  res.json([{ name: "Test Product" }]);
});

// 1. Security Headers Configuration
app.use(helmet());

// 2. Cross-Origin Resource Sharing with Cookie Credentials
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Ensure production domains are always allowed
if (!allowedOrigins.includes('https://suryodayafarms.com')) {
  allowedOrigins.push('https://suryodayafarms.com');
}
if (!allowedOrigins.includes('https://www.suryodayafarms.com')) {
  allowedOrigins.push('https://www.suryodayafarms.com');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or REST client requests with no origin
    if (!origin) return callback(null, true);
    
    const isNgrok = origin.match(/^https?:\/\/[a-zA-Z0-9.-]+\.ngrok-free\.(dev|app)$/) ||
                    origin.match(/^https?:\/\/[a-zA-Z0-9.-]+\.ngrok\.io$/);
    const isLocalhost = origin.match(/^https?:\/\/localhost:\d+$/) ||
                        origin.match(/^https?:\/\/127\.0\.0\.1:\d+$/);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*') || isNgrok || isLocalhost) {
      return callback(null, true);
    } else {
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Built-in Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 4. Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 300, // Relax limits in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// 5. System Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV, timestamp: new Date() });
});

// --- REST Route Integrations ---
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

app.use('/api/auth', authRoutes);         // Sign-in, Register, Profile, Saved Addresses
app.use('/api/products', productRoutes);     // Products catalog, reviews, category lists
app.use('/api/categories', productRoutes);   // Double-bind categories fetching
app.use('/api/cart', orderRoutes);           // Cart item CRUD
app.use('/api/wishlist', orderRoutes);       // Wishlist toggles
app.use('/api/coupons', orderRoutes);        // Coupon validate actions
app.use('/api/orders', orderRoutes);         // Order checkouts, payments, and histories
app.use('/api/admin', adminRoutes);          // Dashboard metrics and administrative edits
app.use('/api/public', publicRoutes);        // Blog chronicle lists, testimonials, contact submit

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error Handler] ${req.method} ${req.url} - Status: ${statusCode} - Error: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
