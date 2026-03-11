const applicationService = require('../services/applicationService');

const applyForJob = async (req, res) => {
    try {
        const { job, resumeUrl } = req.body;
        const createdApp = await applicationService.applyForJob(job, resumeUrl, req.user._id);
        res.status(201).json(createdApp);
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You have already applied for this job') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getApplications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const result = await applicationService.getApplications(req.user.role, req.user._id, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const updatedApp = await applicationService.updateApplicationStatus(req.params.id, req.body);
        res.json(updatedApp);
    } catch (error) {
        if (error.message === 'Application not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const withdrawApplication = async (req, res) => {
    try {
        const result = await applicationService.withdrawApplication(req.params.id, req.user._id);
        res.json(result);
    } catch (error) {
        if (error.message === 'Application not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not authorized to withdraw this application') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getApplicationByRoom = async (req, res) => {
    try {
        const application = await applicationService.getApplicationByRoom(req.params.roomId, req.user._id, req.user.role);
        res.json(application);
    } catch (error) {
        if (error.message === 'Interview room not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not authorized to access this room') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    applyForJob,
    getApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationByRoom
};
