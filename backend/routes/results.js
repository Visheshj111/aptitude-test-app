const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Question = require('../models/Question');
const User = require('../models/User'); // We need to import the User model to find the user's email
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/results/submit
// @desc    Submits test, calculates score, and saves result with the user's email
// @access  Private
router.post('/submit', authMiddleware, async (req, res) => {
    const { answers } = req.body;
    const userId = req.user.id;

    try {
        // --- NEW STEP: Find the user who submitted the test to get their email ---
        const user = await User.findById(userId).select('email');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const questionIds = Object.keys(answers);
        const correctAnswers = await Question.find({ '_id': { $in: questionIds } });

        let score = 0;
        correctAnswers.forEach(question => {
            if (question.correctAnswer === answers[question._id]) {
                score++;
            }
        });

        const totalQuestions = questionIds.length;
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        
        // If a result for this user already exists, update it instead of creating a new one
        const existingResult = await Result.findOne({ userId });
        if (existingResult) {
            existingResult.score = score;
            existingResult.totalQuestions = totalQuestions;
            existingResult.percentage = percentage;
            existingResult.userEmail = user.email; // Also update the email here
            existingResult.submittedAt = Date.now();
            await existingResult.save();
            return res.status(200).json({
                message: "Test submitted successfully! Your result has been updated.",
                score,
                totalQuestions,
                percentage,
                userEmail: user.email
            });
        }
        
        // Create a new result document if one doesn't exist
        const newResult = new Result({
            userId,
            userEmail: user.email, // Save the user's email along with the result
            score,
            totalQuestions,
            percentage
        });

        await newResult.save();

        res.status(201).json({ 
            message: "Test submitted successfully!",
            score,
            totalQuestions,
            percentage,
            userEmail: user.email
        });

    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   GET api/results/check-completion
// @desc    Check if user has already completed the test
// @access  Private
router.get('/check-completion', authMiddleware, async (req, res) => {
    try {
        const result = await Result.findOne({ userId: req.user.id });
        
        res.status(200).json({ 
            hasCompleted: !!result,
            result: result || null
        });
    } catch (error) {
        console.error('Check completion error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// This route is no longer needed for the student view but is useful for potential admin features.
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await Result.findOne({ userId: req.user.id }).sort({ submittedAt: -1 });

        if (!result) {
            return res.status(404).json({ message: 'No result found for this user.' });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;

