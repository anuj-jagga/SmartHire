const jobService = require('../services/jobService');

const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const location = req.query.location || '';
        const minSalary = req.query.minSalary || '';
        const maxSalary = req.query.maxSalary || '';
        const status = req.query.status || '';

        const jobsData = await jobService.getAllJobs({ page, limit, search, location, minSalary, maxSalary, reqStatus: status });
        res.json(jobsData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await jobService.getJobById(req.params.id);
        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createJob = async (req, res) => {
    try {
        const createdJob = await jobService.createJob(req.body, req.user._id);
        res.status(201).json(createdJob);
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const result = await jobService.deleteJob(req.params.id, req.user._id, req.user.role);
        res.json(result);
    } catch (error) {
        if (error.message === 'Job not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Not authorized to delete this job') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    deleteJob
};
