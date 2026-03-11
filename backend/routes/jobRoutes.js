const express = require('express');
const { protect, adminHR } = require('../middleware/authMiddleware');
const jobController = require('../controllers/jobController');
const { validateJobPost } = require('../middleware/validators');

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
router.get('/', jobController.getAllJobs);

// @desc    Get job by ID
// @route   GET /api/jobs/:id
router.get('/:id', jobController.getJobById);

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin/HR
router.post('/', protect, adminHR, validateJobPost, jobController.createJob);

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin/HR
router.delete('/:id', protect, adminHR, jobController.deleteJob);

module.exports = router;
