const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const resetAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        for (const user of users) {
            user.password = 'password123';
            await user.save();
        }

        console.log('All passwords reset to: password123');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetAll();
