const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    jdUrl: { type: String },
    requirements: [{ type: String }],
    location: { type: String, required: true },
    salary: { type: String },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
