const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.connect('mongodb://127.0.0.1:27017/smarthire')
    .then(async () => {
        // Find the application the user is looking at
        const hrUser = await mongoose.connection.db.collection('users').findOne({ email: 'hr@gmail.com' });
        const app = await mongoose.connection.db.collection('applications').findOne({});

        if (app) {
            const meetingLink = crypto.randomUUID();
            await mongoose.connection.db.collection('applications').updateOne(
                { _id: app._id },
                { $set: { status: 'Interviewing', meetingLink: meetingLink } }
            );

            const updatedApp = await mongoose.connection.db.collection('applications').findOne({ _id: app._id });
            console.log(updatedApp);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
