const axios = require('axios');

async function testBullMQSpeed() {
    try {
        console.log("=======================================");
        console.log("TESTING ASYNCHRONOUS BULLMQ PIPELINE");
        console.log("=======================================");

        const rand = Math.floor(Math.random() * 100000);
        const hrEmail = `test_hr_${rand}@example.com`;
        const candidateEmail = `test_candidate_${rand}@example.com`;

        // 1. Register HR
        const hrReg = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'HR BullMQ Tester',
            email: hrEmail,
            password: 'password123',
            role: 'HR'
        });
        const hrToken = hrReg.data.token;

        // 2. Register Candidate
        const candReg = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Candidate BullMQ Tester',
            email: candidateEmail,
            password: 'password123',
            role: 'Candidate'
        });
        const candToken = candReg.data.token;
        const candId = candReg.data.user._id;

        // 3. HR Posts Job
        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Latency Test Engineer',
            company: 'SpeedCheck Inc',
            description: 'Testing Async Queues',
            requirements: 'BullMQ',
            location: 'Remote',
            salary: '$150k'
        }, { headers: { Authorization: `Bearer ${hrToken}` } });
        const jobId = jobRes.data._id;

        // 4. Candidate Applies
        const applyRes = await axios.post('http://localhost:5000/api/applications', {
            job: jobId,
            resumeUrl: '/uploads/dummy.pdf'
        }, { headers: { Authorization: `Bearer ${candToken}` } });
        const appId = applyRes.data._id;

        // 5. HR Rejects Candidate (TRIGGERS EMAIL)
        console.log("\nBeginning Application Status Update (Rejecting)...");
        const startTime = Date.now();

        const updateRes = await axios.put(`http://localhost:5000/api/applications/${appId}/status`, {
            status: 'Rejected'
        }, { headers: { Authorization: `Bearer ${hrToken}` } });

        const endTime = Date.now();
        const latency = endTime - startTime;

        console.log(`API Responded in ${latency}ms!`);
        if (latency < 200) {
            console.log("SUCCESS! The API is no longer blocking on network email dispatch.");
            console.log("Check the backend console above. You should see the BullMQ Worker pick up the job *after* this response!");
        } else {
            console.log("WARNING: The API took too long. It might still be blocking.");
        }

    } catch (e) {
        console.error("Test Error:", e.response?.data || e.message);
    }
}
testBullMQSpeed();
