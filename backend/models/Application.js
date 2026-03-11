const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    jobTitle: { type: String, required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['Applied', 'Reviewed', 'Interviewing', 'Interview Conducted', 'Offered', 'Rejected'], default: 'Applied', index: true },
    resumeUrl: { type: String, required: true },
    interviewDate: { type: Date },
    interviewNotes: { type: String },
    meetingLink: { type: String },
    aiScore: { type: Number },
    aiFeedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
