const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(staticPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
