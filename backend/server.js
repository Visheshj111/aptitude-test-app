// Main entry point for the backend application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON format

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Successfully connected to MongoDB Atlas!'))
.catch(err => console.error('MongoDB connection error:', err));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', require('./routes/questions'));
app.use('/api/results', resultRoutes);

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('Assessment App Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

