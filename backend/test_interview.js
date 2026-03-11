const mongoose = require('mongoose');
const crypto = require('crypto');

mongoose.connect('mongodb://127.0.0.1:27017/smarthire')
    .then(async () => {
        // Find an application to set to Interviewing
        const app = await mongoose.connection.db.collection('applications').findOne({});

        if (app) {
            const meetingLink = crypto.randomUUID();
            await mongoose.connection.db.collection('applications').updateOne(
                { _id: app._id },
                { $set: { status: 'Interviewing', meetingLink: meetingLink } }
            );
            console.log(`Successfully updated application for Candidate: ${app.candidate} to 'Interviewing'.`);
            console.log(`A 'Join Room' button should now appear on the Dashboard.`);
        } else {
            console.log("No applications found in the database. Please apply to a job first.");
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
