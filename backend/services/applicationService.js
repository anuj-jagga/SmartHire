const Application = require('../models/Application');
const Job = require('../models/Job');
const { emailQueue } = require('../config/queue');
const crypto = require('crypto');

const applyForJob = async (jobId, resumeUrl, userId) => {
    const jobDoc = await Job.findById(jobId);
    if (!jobDoc) {
        throw new Error('Job not found');
    }

    const existingApp = await Application.findOne({ job: jobId, candidate: userId });
    if (existingApp) {
        throw new Error('You have already applied for this job');
    }

    // --- Simulated AI Resume Screening Engine ---
    // Generate a realistic but mock ATS match score between 65 and 98
    const aiScore = Math.floor(Math.random() * (98 - 65 + 1)) + 65;
    
    let aiFeedback = '';
    if (aiScore >= 90) {
        aiFeedback = 'Excellent match! The resume heavily aligns with the required skills, displaying strong relevant domain experience and keyword matching.';
    } else if (aiScore >= 80) {
        aiFeedback = 'Strong match. Candidate shows proficiency in core technologies, though some secondary requirements might be light.';
    } else if (aiScore >= 70) {
        aiFeedback = 'Moderate match. Covers the basic prerequisites but may require training or lacks deep experience in the primary tech stack.';
    } else {
        aiFeedback = 'Low match. The resume is missing several key requirements or experience levels specified in the Job Description.';
    }
    // ---------------------------------------------

    const application = new Application({
        job: jobId,
        jobTitle: jobDoc.title,
        candidate: userId,
        resumeUrl,
        aiScore,
        aiFeedback
    });

    return await application.save();
};

const getApplications = async (userRole, userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    let query = {};
    if (userRole === 'HR') {
        // HR can only see applications for jobs they posted
        const hrJobs = await Job.find({ postedBy: userId }).select('_id');
        const jobIds = hrJobs.map(j => j._id);
        query = { job: { $in: jobIds } };
    } else if (userRole !== 'Admin') {
        // Candidates only see their own
        query = { candidate: userId };
    }

    const applications = await Application.find(query)
        .sort({ createdAt: -1 })
        .populate('candidate', 'name email')
        .populate('job', 'title company description location salary minSalary maxSalary jdUrl requirements')
        .skip(skip)
        .limit(limit);

    const total = await Application.countDocuments(query);

    return {
        applications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

const updateApplicationStatus = async (appId, updateData) => {
    const { status, interviewDate, interviewNotes } = updateData;
    const application = await Application.findById(appId);

    if (!application) {
        throw new Error('Application not found');
    }

    application.status = status;
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewNotes) application.interviewNotes = interviewNotes;

    if (status === 'Interviewing' && !application.meetingLink) {
        application.meetingLink = crypto.randomUUID();
    }

    if (!application.jobTitle && application.job) {
        const jobDoc = await Job.findById(application.job);
        application.jobTitle = jobDoc ? jobDoc.title : 'Unknown Job';
    }

    await application.save();

    // Fetch candidate details for email
    const populatedApp = await Application.findById(appId).populate('candidate', 'name email');

    if (populatedApp && populatedApp.candidate && populatedApp.candidate.email) {
        if (status === 'Interviewing') {
            const dateStr = interviewDate ? new Date(interviewDate).toLocaleString() : 'TBD';
            const notesStr = interviewNotes ? `<p><strong>Instructions/Notes:</strong> ${interviewNotes}</p>` : '';
            const meetingStr = populatedApp.meetingLink ? `<p><strong>Virtual Interview Room:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/interview/${populatedApp.meetingLink}">Join Here</a></p>` : '';

            const html = `
                <h2>Interview Scheduled</h2>
                <p>Hello ${populatedApp.candidate.name},</p>
                <p>Congratulations! You have been selected for an interview for the <strong>${populatedApp.jobTitle}</strong> position.</p>
                <p><strong>Date & Time:</strong> ${dateStr}</p>
                ${meetingStr}
                ${notesStr}
                <br/>
                <p>Best Regards,</p>
                <p>SmartHire HR Team</p>
            `;

            emailQueue.add('send-interview-email', {
                options: {
                    to: populatedApp.candidate.email,
                    subject: `Interview Scheduled: ${populatedApp.jobTitle}`,
                    html
                }
            });
        } else if (status === 'Offered') {
            const html = `
                <h2>Job Offer</h2>
                <p>Hello ${populatedApp.candidate.name},</p>
                <p>We are thrilled to extend an offer for the <strong>${populatedApp.jobTitle}</strong> position.</p>
                <p>Our HR team will be in touch shortly with the official offer letter and next steps.</p>
                <br/>
                <p>Welcome aboard,</p>
                <p>SmartHire HR Team</p>
            `;

            emailQueue.add('send-offer-email', {
                options: {
                    to: populatedApp.candidate.email,
                    subject: `Job Offer: ${populatedApp.jobTitle}`,
                    html
                }
            });
        } else if (status === 'Rejected') {
            const html = `
                <h2>Application Update</h2>
                <p>Hello ${populatedApp.candidate.name},</p>
                <p>Thank you for taking the time to apply and interview for the <strong>${populatedApp.jobTitle}</strong> position.</p>
                <p>While we were impressed by your background, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this role.</p>
                <p>We wish you the best of luck in your job search and future professional endeavors.</p>
                <br/>
                <p>Best Regards,</p>
                <p>SmartHire HR Team</p>
            `;

            emailQueue.add('send-rejection-email', {
                options: {
                    to: populatedApp.candidate.email,
                    subject: `Application Update: ${populatedApp.jobTitle}`,
                    html
                }
            });
        } else if (status === 'Interview Conducted') {
            const html = `
                <h2>Interview Completed</h2>
                <p>Hello ${populatedApp.candidate.name},</p>
                <p>Thank you for taking the time to interview for the <strong>${populatedApp.jobTitle}</strong> position.</p>
                <p>Your interview has been marked as conducted. Our team is currently reviewing the feedback and will be in touch with you regarding the next steps in the hiring process.</p>
                <br/>
                <p>Best Regards,</p>
                <p>SmartHire HR Team</p>
            `;

            emailQueue.add('send-conducted-email', {
                options: {
                    to: populatedApp.candidate.email,
                    subject: `Interview Update: ${populatedApp.jobTitle}`,
                    html
                }
            });
        }
    }

    return application.toObject();
};

const withdrawApplication = async (appId, userId) => {
    const application = await Application.findById(appId);

    if (!application) {
        throw new Error('Application not found');
    }

    if (application.candidate.toString() !== userId.toString()) {
        throw new Error('Not authorized to withdraw this application');
    }

    await Application.deleteOne({ _id: appId });
    return { message: 'Application withdrawn successfully' };
};

const getApplicationByRoom = async (roomId, userId, userRole) => {
    const application = await Application.findOne({ meetingLink: roomId })
        .populate('candidate', 'name email')
        .populate('job', 'title company');

    if (!application) {
        throw new Error('Interview room not found');
    }

    if (userRole === 'Candidate' && application.candidate._id.toString() !== userId.toString()) {
        throw new Error('Not authorized to access this room');
    }

    return application;
};

module.exports = {
    applyForJob,
    getApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationByRoom
};
