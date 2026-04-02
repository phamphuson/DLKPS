const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/products', authMiddleware, productRoutes);
app.use('/api/v1/products/:productId/reviews', authMiddleware, reviewRoutes);
app.use('/api/v1/categories', authMiddleware, categoryRoutes);
app.use('/api/v1/orders', authMiddleware, orderRoutes);
app.use('/api/v1/inventory', authMiddleware, inventoryRoutes);
app.use('/api/v1/messages', authMiddleware, messageRoutes);
app.use('/api/v1/cart', authMiddleware, cartRoutes);
app.use('/api/v1/addresses', authMiddleware, addressRoutes);
app.use('/api/v1/payments', authMiddleware, paymentRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API v1 with Prisma and MongoDB is running!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
