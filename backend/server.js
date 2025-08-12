const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: './.env' }); 

// Connect to database
connectDB();

// --- ALL Route files ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const brandRoutes = require('./routes/brands');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const campaignRoutes = require('./routes/campaigns');
const cartRoutes = require('./routes/cart');
const settingsRoutes = require('./routes/settings');
const configurationRoutes = require('./routes/configuration');
const reportsRoutes = require('./routes/reports');
const mediaRoutes = require('./routes/media');
const roleRoutes = require('./routes/roles');
const notificationRoutes = require('./routes/notifications');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');
const auditLogRoutes = require('./routes/auditLog'); // <<<--- 1. IMPORT THE NEW ROUTE FILE

const app = express();

// Force HTTPS in production
// NOTE: This block is often not needed on modern hosting platforms (like Render, Heroku) as they handle this automatically.
// You can usually remove it safely.
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// Dev logging middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Gzip compressing
app.use(compression());

// Set security HTTP headers using Helmet
app.use(helmet());

// Body parser middleware
app.use(express.json());

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// --- ✅ DYNAMIC CORS CONFIGURATION - CORRECTED FOR PRODUCTION ✅ ---
// This now relies only on the FRONTEND_URL from your .env file.
const allowedOrigins = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

// app.use(cors(corsOptions));
app.use(cors({ origin: true, credentials: true })); // only for testing

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Only apply the rate limiting middleware in production
if (process.env.NODE_ENV === 'production') {
    app.use('/api', limiter);
}

// --- Mount ALL routers ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/configuration', configurationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auditlog', auditLogRoutes); // <<<--- 2. MOUNT THE NEW ROUTE

// Use the centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
});