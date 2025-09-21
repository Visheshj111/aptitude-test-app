const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// --- DIAGNOSTIC MESSAGE ---
console.log('SUCCESS: The questions.js route file was loaded by the server.');

// @route   GET api/questions/:section
// @desc    Get all questions for a specific section
// @access  Public
router.get('/:section', async (req, res) => {
    try {
        const questions = await Question.find({ section: req.params.section });
        if (!questions || questions.length === 0) {
            return res.status(404).json({ msg: 'No questions found for this section' });
        }
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/questions/add
// @desc    Add a new question
// @access  Public (for development)
router.post('/add', async (req, res) => {
    const { section, questionText, options, correctAnswer } = req.body;
    try {
        const newQuestion = new Question({
            section,
            questionText,
            options,
            correctAnswer,
        });
        const question = await newQuestion.save();
        res.status(201).json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;