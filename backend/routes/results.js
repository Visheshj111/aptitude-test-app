const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/results/submit
// Submits answers, calculates score, and saves the result
router.post('/submit', authMiddleware, async (req, res) => {
    const { answers } = req.body; // Expects answers in format: { "questionId": "selectedOption" }
    const userId = req.user.id;

    try {
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
        
        const existingResult = await Result.findOne({ userId });
        if (existingResult) {
            existingResult.score = score;
            existingResult.totalQuestions = totalQuestions;
            existingResult.percentage = percentage;
            existingResult.submittedAt = Date.now();
            await existingResult.save();
            res.status(200).json({
                message: "Result updated successfully",
                result: existingResult
            });
            return;
        }

        const result = new Result({
            userId,
            score,
            totalQuestions,
            percentage
        });

        await result.save();

        res.status(201).json({ 
            message: "Test submitted successfully!",
            result
        });

    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// GET /api/results
// Fetches the latest result for the logged-in user
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

