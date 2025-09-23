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

// --- THIS IS THE CORS FIX ---
// We define a list of approved frontend URLs.
const allowedOrigins = [
    'https://cognizant-assessment.netlify.app',
    'https://aptitude-test-app-kappa.vercel.app', // Your Vercel domain from the prompt
    'https://bottleup.me' // Your future custom domain
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
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

// --- THIS IS THE DEBUG TEST ROUTE ---
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is reachable and CORS is configured correctly! ✅" });
});


// A simple root route to confirm the backend is running
app.get('/', (req, res) => {
    res.send('Aptitude Assessment Backend is running!');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

