const axios = require('axios');

const testLogin = async () => {
    try {
        const email = 'admin@gmail.com';
        const password = 'password123';

        console.log(`Attempting login with: ${email} / ${password}`);

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });

        console.log('Login successful!');
        console.log('Token received:', response.data.token ? 'Yes' : 'No');
        console.log('User Role:', response.data.role);
    } catch (err) {
        console.error('Login failed.');
        console.error('Status:', err.response?.status);
        console.error('Message:', err.response?.data?.message || err.message);
    }
};

testLogin();
