const Job = require('../models/Job');
const Application = require('../models/Application');

const getAllJobs = async ({ page = 1, limit = 10, search = '', location = '', minSalary = '', maxSalary = '', reqStatus = '' } = {}) => {
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
        query.$or = [
            { title: new RegExp(search, 'i') },
            { company: new RegExp(search, 'i') }
        ];
    }
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    // Status filtering
    if (reqStatus) {
        query.status = reqStatus;
    }

    // Numeric salary range filtering - Range Overlap Logic
    if (minSalary !== '' || maxSalary !== '') {
        if (minSalary !== '') {
            query.maxSalary = { $gte: Number(minSalary) };
        }
        if (maxSalary !== '') {
            if (!query.minSalary) query.minSalary = {};
            query.minSalary.$lte = Number(maxSalary);
        }
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
        .populate('postedBy', 'name email')
        .skip(skip)
        .limit(limit);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: jobs
    };
};

const getJobById = async (jobId) => {
    return await Job.findById(jobId).populate('postedBy', 'name email');
};

const createJob = async (jobData, userId) => {
    const { title, company, description, jdUrl, requirements, location, salary, minSalary, maxSalary } = jobData;
    const job = new Job({
        title,
        company,
        description,
        jdUrl,
        requirements,
        location,
        salary,
        minSalary,
        maxSalary,
        postedBy: userId
    });
    return await job.save();
};

const deleteJob = async (jobId, userId, userRole) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error('Job not found');
    }

    if (job.postedBy.toString() !== userId.toString() && userRole !== 'Admin') {
        throw new Error('Not authorized to delete this job');
    }

    await Job.deleteOne({ _id: jobId });
    await Application.deleteMany({ job: jobId });

    return { message: 'Job removed' };
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    deleteJob
};
