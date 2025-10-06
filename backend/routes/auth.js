const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please provide all required fields: username, email, and password' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email address' });
        }

        // Check if username is taken
        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ msg: 'Username is already taken' });
        }

        // The pre-save hook in User.js will automatically hash the password
        user = new User({
            username,
            email: email.toLowerCase(),
            password,
        });
        
        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 }, // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err);
                    return res.status(500).json({ msg: 'Error generating authentication token' });
                }
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error('Registration Error:', err);
        
        // Handle MongoDB duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ msg: `${field} already exists` });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // --- THIS IS THE FIX ---
        // We must explicitly select the password, which is hidden by default in the User model.
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Use the matchPassword method from the User model for comparison
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;

