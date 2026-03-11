const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/smarthire')
    .then(async () => {
        const apps = await mongoose.connection.db.collection('applications').find({}).toArray();
        for (let app of apps) {
            console.log(app._id, app.status, app.meetingLink);
            if (app.status === 'Interviewing') {
                await mongoose.connection.db.collection('applications').updateOne(
                    { _id: app._id },
                    { $set: { meetingLink: "test-room-1234" } }
                );
                console.log("Forced meetingLink to test-room-1234 on Interviewing application");
            }
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
