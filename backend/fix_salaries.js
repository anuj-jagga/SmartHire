const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/smarthire')
    .then(async () => {
        const jobs = await mongoose.connection.db.collection('jobs').find({ minSalary: { $gte: 1000 } }).toArray();
        for (let job of jobs) {
            await mongoose.connection.db.collection('jobs').updateOne(
                { _id: job._id },
                { $set: { minSalary: job.minSalary / 1000, maxSalary: job.maxSalary ? job.maxSalary / 1000 : null } }
            );
        }
        console.log(`Fixed ${jobs.length} jobs.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
