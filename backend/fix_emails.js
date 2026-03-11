const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const standardizeEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');

        const updateEmail = async (oldEmail, newEmail) => {
            const user = await User.findOne({ email: oldEmail });
            if (user) {
                user.email = newEmail;
                user.password = 'password123'; // ensure password is set to known value

                // bypass pre-save hook to prevent double hashing
                await User.findByIdAndUpdate(user._id, { email: newEmail, password: user.password });
                console.log(`Updated ${oldEmail} to ${newEmail}`);
            } else {
                console.log(`User ${oldEmail} not found`);
            }
        };

        // Fix potential double-hashing on all existing accounts by doing a direct update
        const users = await User.find({});
        for (const u of users) {
            const salt = require('bcryptjs').genSaltSync(10);
            const hash = require('bcryptjs').hashSync('password123', salt);
            await User.findByIdAndUpdate(u._id, { password: hash });
            console.log(`Force reset password hash for ${u.email}`);
        }

        await updateEmail('user1@gmail.com', 'user@gmail.com');
        await updateEmail('admin1@gmail.com', 'admin@gmail.com');

        console.log('Done standardizing emails and force-resetting hashes.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

standardizeEmails();
