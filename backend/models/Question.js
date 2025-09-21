const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['Verbal Ability', 'Quantitative Aptitude', 'Logical Reasoning'],
    },
    questionText: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: [v => v.length === 4, 'Question must have exactly 4 options'],
    },
    correctAnswer: {
        type: String,
        required: true,
    },
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;

