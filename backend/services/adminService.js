const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getDashboardStats = async () => {
    // 1. Total counts
    const totalStudents = await User.countDocuments({ role: 'Candidate' });
    const totalJobs = await Job.countDocuments();
    const selectedCount = await Application.countDocuments({ status: 'Offered' });

    // 2. Department-wise placement stats (grouping by jobTitle or you can join with Job model)
    const placementStats = await Application.aggregate([
        { $match: { status: 'Offered' } },
        { $group: { _id: "$jobTitle", count: { $sum: 1 } } },
        { $project: { department: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
    ]);

    // 3. Status Distribution
    const statusDistribution = await Application.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
    ]);

    // 4. Job-wise selection stats (Applications vs Offered for each Job)
    const jobWiseStats = await Application.aggregate([
        {
            $group: {
                _id: "$job",
                jobTitle: { $first: "$jobTitle" },
                totalApplications: { $sum: 1 },
                offered: {
                    $sum: { $cond: [{ $eq: ["$status", "Offered"] }, 1, 0] }
                },
                pending: {
                    $sum: { $cond: [{ $in: ["$status", ["Applied", "Reviewed"]] }, 1, 0] }
                },
                interviewing: {
                    $sum: { $cond: [{ $in: ["$status", ["Interviewing", "Interview Conducted"]] }, 1, 0] }
                },
                rejected: {
                    $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "_id",
                foreignField: "_id",
                as: "jobDetails"
            }
        },
        {
            $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                jobTitle: 1,
                company: { $ifNull: ["$jobDetails.company", "N/A"] },
                totalApplications: 1,
                offered: 1,
                pending: 1,
                interviewing: 1,
                rejected: 1,
                _id: 0
            }
        },
        { $sort: { totalApplications: -1 } },
        { $limit: 10 }
    ]);

    return {
        totalStudents,
        totalJobs,
        selectedCount,
        placementStats,
        statusDistribution,
        jobWiseStats
    };
};

module.exports = {
    getDashboardStats
};
