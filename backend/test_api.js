const axios = require('axios');

async function testApi() {
    try {
        console.log("Sending GET /api/jobs ...");
        const res = await axios.get('http://localhost:5000/api/jobs');
        console.log("Responded successfully:", res.status);
    } catch (e) {
        console.error("API failed:", e.message);
    }
}
testApi();
