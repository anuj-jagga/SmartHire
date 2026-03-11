const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const Application = require('./models/Application');
        // Make sure Job model is registered
        require('./models/Job');

        const app = await Application.findOne({ jobTitle: 'Pagination Stress Tester' })
            .populate('job', 'title company description location salary minSalary maxSalary jdUrl requirements');

        console.log("POPULATED JOB:", JSON.stringify(app.job, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
});
