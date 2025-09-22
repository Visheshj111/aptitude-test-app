const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// @route   GET api/questions/test
// @desc    Get a complete, randomized test with a specific number of questions from each section
// @access  Public (for now, will be protected later)
router.get('/test', async (req, res) => {
    try {
        // Define the number of questions to fetch from each section
        const verbalCount = 12;
        const logicalCount = 13;
        const quantitativeCount = 25;

        // Use MongoDB's aggregation pipeline with $sample to efficiently get random questions
        const verbalQuestions = await Question.aggregate([
            { $match: { section: 'Verbal Ability' } },
            { $sample: { size: verbalCount } }
        ]);

        const logicalQuestions = await Question.aggregate([
            { $match: { section: 'Logical Reasoning' } },
            { $sample: { size: logicalCount } }
        ]);

        const quantitativeQuestions = await Question.aggregate([
            { $match: { section: 'Quantitative Aptitude' } },
            { $sample: { size: quantitativeCount } }
        ]);

        // Combine all questions into a single array
        const testQuestions = [...verbalQuestions, ...logicalQuestions, ...quantitativeQuestions];

        // Shuffle the combined array for a truly random question order
        const shuffledTest = testQuestions.sort(() => 0.5 - Math.random());

        // A helpful warning for you in the server logs if you don't have enough questions
        if (verbalQuestions.length < verbalCount || logicalQuestions.length < logicalCount || quantitativeQuestions.length < quantitativeCount) {
             console.warn('Warning: Not enough questions in the database to meet the requested counts.');
        }

        res.json(shuffledTest);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// This route is kept for your admin purposes, like adding new questions via curl commands
// @route   POST api/questions/add
// @desc    Add a new question
// @access  Public (for development)
router.post('/add', async (req, res) => {
    const { section, questionText, options, correctAnswer } = req.body;
    try {
        const newQuestion = new Question({ section, questionText, options, correctAnswer });
        const question = await newQuestion.save();
        res.status(201).json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

