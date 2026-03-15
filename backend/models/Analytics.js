const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        enum: [
            'APPLICATION_SUBMITTED',
            'APPLICATION_WITHDRAWN',
            'APPLICATION_STATUS_UPDATED',
            'INTERVIEW_SCHEDULED',
            'USER_REGISTERED',
            'USER_LOGIN'
        ]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
