const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // --- NEW FIELD ---
    // We will now store the user's email directly for easy viewing.
    userEmail: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

const Result = mongoose.model('Result', ResultSchema);

module.exports = Result;

