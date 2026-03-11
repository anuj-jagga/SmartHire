const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Required for serving images via express.static
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser limit

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve static upload folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Centralized error handling
app.use(errorHandler);

module.exports = app;
