const Interview = require('../models/Interview');

const scheduleInterview = async (interviewData, userId) => {
    const { application, date, meetingLink } = interviewData;

    const interview = new Interview({
        application,
        interviewer: userId,
        date,
        meetingLink
    });

    return await interview.save();
};

const getInterviews = async (userRole, userId) => {
    const interviews = await Interview.find({})
        .populate('interviewer', 'name email')
        .populate({
            path: 'application',
            populate: [
                { path: 'candidate', select: 'name email' },
                { path: 'job', select: 'title' }
            ]
        });

    if (userRole === 'Candidate') {
        return interviews.filter(inv => inv.application && inv.application.candidate && inv.application.candidate._id.toString() === userId.toString());
    }

    return interviews;
};

const updateInterviewFeedback = async (interviewId, feedbackData) => {
    const { feedback, status } = feedbackData;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
        throw new Error('Interview not found');
    }

    if (feedback) interview.feedback = feedback;
    if (status) interview.status = status;

    return await interview.save();
};

module.exports = {
    scheduleInterview,
    getInterviews,
    updateInterviewFeedback
};
