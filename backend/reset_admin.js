const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');

        const email = 'admin1@gmail.com';
        const newPassword = 'admin123';

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();

        console.log(`Password reset successfully for ${email}`);
        console.log(`Temporary password: ${newPassword}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetAdmin();
