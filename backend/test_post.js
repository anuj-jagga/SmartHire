const axios = require('axios');

async function test() {
    try {
        const rand = Math.floor(Math.random() * 10000);
        const email = `test_hr_${rand}@example.com`;

        // Register HR
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test HR',
            email: email,
            password: 'password123',
            role: 'HR'
        });
        const token = regRes.data.token;
        console.log("Registered and logged in. Token length:", token.length);

        const postRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Test Title',
            description: 'Test Description',
            requirements: 'Test Requirements',
            location: 'Test Location',
            salary: 'Test Salary'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Job posted successfully:", postRes.data);
    } catch (e) {
        console.error("Test Error:", e.response?.data || e.message);
    }
}
test();
