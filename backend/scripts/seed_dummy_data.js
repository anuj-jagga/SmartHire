const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config({ path: './.env' });

const START_INDEX = 1;
const NUM_CANDIDATES = 36;

const seedDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB.');

        // 1. Get an HR or Admin to be the job poster
        const poster = await User.findOne({ role: { $in: ['HR', 'Admin'] } });
        if (!poster) {
            console.error('Error: No HR or Admin found in DB to post the job. Please create one first.');
            process.exit(1);
        }

        // 2. Create the Dummy Job
        const newJob = new Job({
            title: 'Pagination Stress Tester',
            company: 'Test Corporation Ltd.',
            description: 'This is a strictly temporary dummy job created to test out the application pagination UI and Job-wise Selection Breakdown tables. Do not actually apply for this.',
            location: 'Remote Workspace',
            salary: 'N/A',
            postedBy: poster._id,
            status: 'Open'
        });
        const savedJob = await newJob.save();
        console.log(`Created Job: ${savedJob.title} (ID: ${savedJob._id})`);

        // 3. Create Dummy Users and immediately apply them to the job
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        let usersCreated = 0;
        let appsCreated = 0;

        for (let i = START_INDEX; i < START_INDEX + NUM_CANDIDATES; i++) {
            const num = String(i).padStart(2, '0');
            const email = `testcand${num}@example.com`;

            // Check if user already exists
            let cand = await User.findOne({ email });
            if (!cand) {
                cand = new User({
                    name: `test cand ${num}`,
                    email: email,
                    password: hashedPassword,
                    role: 'Candidate'
                });
                await cand.save();
                usersCreated++;
            }

            // Apply to the Job
            const existingApp = await Application.findOne({ candidate: cand._id, job: savedJob._id });
            if (!existingApp) {
                const app = new Application({
                    job: savedJob._id,
                    jobTitle: savedJob.title,
                    candidate: cand._id,
                    status: 'Applied', // Set all to Pending/Applied by default
                    resumeUrl: 'dummy_url.pdf'
                });
                await app.save();
                appsCreated++;
            }
        }

        console.log(`Successfully created ${usersCreated} dummy candidates.`);
        console.log(`Successfully assigned ${appsCreated} applications to the Stress Tester job.`);
        console.log('Seed complete!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding dummy data:', err);
        process.exit(1);
    }
};

seedDummyData();
