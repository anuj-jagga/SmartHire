const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    meetingLink: { type: String },
    feedback: { type: String },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);
