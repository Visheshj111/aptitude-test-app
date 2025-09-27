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

// --- THIS IS THE DEFINITIVE CORS FIX ---
// We create a "guest list" of all the frontend URLs that are allowed to talk to this backend.
const allowedOrigins = [
    'https://aptitude-test-2vketx4mg-visheshj111s-projects.vercel.app',
    'https://aptitude-test-app-kappa.vercel.app',
    'https://bottleup.me',      // Your future custom domain
    'http://localhost:5500',  // For local testing with VS Code Live Server
    'http://127.0.0.1:5500'   // Also for local testing
];

const corsOptions = {
    origin: function (origin, callback) {
        // If the incoming request's domain is on our guest list, allow it.
        // The '!origin' part allows requests from tools like Postman or Insomnia.
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS policy.'));
        }
    }
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

const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://aptitude-test-2vketx4mg-visheshj111s-projects.vercel.app',
        'https://aptitude-test-app-kappa.vercel.app'  // Your actual Vercel URL
    ],
    credentials: true
}));
