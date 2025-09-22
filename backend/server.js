// Main entry point for the backend application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes to be used by the application
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) to allow the frontend to communicate with the backend
app.use(cors());
// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// --- MongoDB Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// Any request to '/api/auth' will be handled by the authRoutes file
app.use('/api/auth', authRoutes);
// Any request to '/api/questions' will be handled by the questionRoutes file
app.use('/api/questions', questionRoutes);
// Any request to '/api/results' will be handled by the resultRoutes file
app.use('/api/results', resultRoutes);

// A simple root route to confirm the backend is running
app.get('/', (req, res) => {
    res.send('Aptitude Assessment Backend is running!');
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

