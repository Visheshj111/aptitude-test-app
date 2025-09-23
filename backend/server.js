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

// --- Middleware ---

// --- THIS IS THE FIX ---
// We are configuring CORS to specifically allow requests only from your live Netlify frontend.
// This is a crucial security best practice.
const corsOptions = {
    origin: 'https://cognizant-assessment.netlify.app',
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// --- MongoDB Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);

// A simple root route to confirm the backend is running
app.get('/', (req, res) => {
    res.send('Aptitude Assessment Backend is running!');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});