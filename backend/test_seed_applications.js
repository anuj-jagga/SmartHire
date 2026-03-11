// test_seed_applications.js
const axios = require('axios');

async function seedApplications() {
    try {
        console.log("=======================================");
        console.log("🌱 SEEDING DB FOR PAGINATION TESTING");
        console.log("=======================================");

        const rand = Math.floor(Math.random() * 100000);
        const hrEmail = `hr_pagetest_${rand}@example.com`;

        // 1. Create one HR user to view these
        const hrReg = await axios.post('http://127.0.0.1:5000/api/auth/register', {
            name: 'HR Pagination Tester',
            email: hrEmail,
            password: 'password123',
            role: 'HR'
        });
        const hrToken = hrReg.data.token;
        console.log("✅ Created HR Tester.");

        // 2. HR Posts ONE Job
        const jobRes = await axios.post('http://127.0.0.1:5000/api/jobs', {
            title: 'Pagination Stress Tester',
            company: 'DataScale Inc',
            description: 'We need to test the frontend limits.',
            requirements: ['Clicking Next Page'],
            location: 'Remote',
            salary: '$120k'
        }, { headers: { Authorization: `Bearer ${hrToken}` } });
        const jobId = jobRes.data._id;
        console.log(`✅ Created Job ID: ${jobId}`);

        // 3. Generate 35 mock candidates and apply to the identical job
        console.log("⏳ Generating 35 Candidate Applications (Triggering 35 Background Emails potentially)...");

        for (let i = 1; i <= 35; i++) {
            const candEmail = `cand_${rand}_${i}@example.com`;

            // Register candidate
            const candReg = await axios.post('http://127.0.0.1:5000/api/auth/register', {
                name: `Test Cand ${i}`,
                email: candEmail,
                password: 'password123',
                role: 'Candidate'
            });
            const candToken = candReg.data.token;

            // Apply to the specific job
            await axios.post('http://localhost:5000/api/applications', {
                job: jobId,
                resumeUrl: `/uploads/test_resume_${i}.pdf`
            }, { headers: { Authorization: `Bearer ${candToken}` } });

            if (i % 10 === 0) console.log(`... Submitted ${i} / 35 applications.`);
        }

        console.log("🚀 SUCCESS! 35 Applications have been seeded.");
        console.log(`Login as: ${hrEmail} / password123 to verify the 4 numbered pages in HRDashboard.`);

    } catch (e) {
        console.error("Test Error:", e.response?.data || e.message);
    }
}
seedApplications();
