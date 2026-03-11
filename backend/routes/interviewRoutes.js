const express = require('express');
const { protect, adminHR } = require('../middleware/authMiddleware');
const interviewController = require('../controllers/interviewController');

const router = express.Router();

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private/HR/Admin
router.post('/', protect, adminHR, interviewController.scheduleInterview);

// @desc    Get all interviews for a user (either interviewer or candidate)
// @route   GET /api/interviews
// @access  Private
router.get('/', protect, interviewController.getInterviews);

// @desc    Provide feedback and update status
// @route   PUT /api/interviews/:id/feedback
// @access  Private/HR/Admin
router.put('/:id/feedback', protect, adminHR, interviewController.updateInterviewFeedback);

module.exports = router;
