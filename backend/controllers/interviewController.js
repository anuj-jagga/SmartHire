const interviewService = require('../services/interviewService');

const scheduleInterview = async (req, res) => {
    try {
        const createdInterview = await interviewService.scheduleInterview(req.body, req.user._id);
        res.status(201).json(createdInterview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getInterviews = async (req, res) => {
    try {
        const interviews = await interviewService.getInterviews(req.user.role, req.user._id);
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateInterviewFeedback = async (req, res) => {
    try {
        const updatedInterview = await interviewService.updateInterviewFeedback(req.params.id, req.body);
        res.json(updatedInterview);
    } catch (error) {
        if (error.message === 'Interview not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    scheduleInterview,
    getInterviews,
    updateInterviewFeedback
};
