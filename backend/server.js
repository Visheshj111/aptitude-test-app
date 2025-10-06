// Main entry point for the backend application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // ← Moved to top
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// CORS Configuration
const corsOptions = {
    origin: [
        'https://www.bottleup.me',
        'https://bottleup.me',
        'https://aptitude-test-2vketx4mg-visheshj111s-projects.vercel.app',
        'https://aptitude-test-app-kappa.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    credentials: true
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