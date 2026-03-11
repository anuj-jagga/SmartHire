const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config({ path: './.env' });

const cleanDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB.');

        // Find users with name matching "test cand" or "Test Cand"
        const dummyUsers = await User.find({ name: { $regex: /^test cand/i } });
        const dummyUserIds = dummyUsers.map(u => u._id);

        console.log(`Found ${dummyUserIds.length} remaining dummy users.`);

        if (dummyUserIds.length > 0) {
            // Delete their applications
            const resultApps = await Application.deleteMany({
                candidate: { $in: dummyUserIds }
            });
            console.log(`Deleted ${resultApps.deletedCount} dummy applications associated with these users.`);
            
            // Delete the users
            const resultUsers = await User.deleteMany({
                _id: { $in: dummyUserIds }
            });
            console.log(`Deleted ${resultUsers.deletedCount} dummy users.`);
        } else {
            console.log("No dummy users found matching the pattern 'Test Cand'.");
        }

        console.log('Dummy data cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error cleaning dummy data:', err);
        process.exit(1);
    }
};

cleanDummyData();
