const express = require('express');
const { protect, adminHR } = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Candidate
router.post('/', protect, applicationController.applyForJob);

// @desc    Get all applications (HR/Admin) or my applications (Candidate)
// @route   GET /api/applications
// @access  Private
router.get('/', protect, applicationController.getApplications);

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin/HR
router.put('/:id/status', protect, adminHR, applicationController.updateApplicationStatus);

// @desc    Withdraw/Delete an application
// @route   DELETE /api/applications/:id
// @access  Private/Candidate
router.delete('/:id', protect, applicationController.withdrawApplication);

// @desc    Get application details by room ID (meetingLink)
// @route   GET /api/applications/room/:roomId
// @access  Private
router.get('/room/:roomId', protect, applicationController.getApplicationByRoom);

module.exports = router;
