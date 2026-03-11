const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');
        const users = await User.find({}, 'email role createdAt password');
        const fs = require('fs');
        let output = `Users found: ${users.length}\n`;
        users.forEach(u => {
            output += `- ${u.email} (${u.role}) - Created: ${u.createdAt} - Hash: ${u.password.substring(0, 10)}...\n`;
        });
        fs.writeFileSync('users_list.txt', output);
        console.log('User list written to users_list.txt');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUsers();
