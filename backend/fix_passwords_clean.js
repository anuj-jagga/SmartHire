const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const fixAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');

        // 1. Get raw DB collection to bypass ALL mongoose hooks
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // 2. Generate ONE clean hash for 'password123'
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        // 3. Directly update ALL users with this exact hash
        const result = await usersCollection.updateMany(
            {},
            { $set: { password: hash } }
        );
        console.log(`Successfully reset passwords for ${result.modifiedCount} users to 'password123'`);

        // 4. Also standardize the emails from what the user typed in the screenshot
        await usersCollection.updateOne({ email: 'user1@gmail.com' }, { $set: { email: 'user@gmail.com' } });
        await usersCollection.updateOne({ email: 'admin1@gmail.com' }, { $set: { email: 'admin@gmail.com' } });

        console.log('Successfully standardized emails to user@gmail.com and admin@gmail.com');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixAll();
