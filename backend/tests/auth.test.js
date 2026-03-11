const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer;

// Start the memory server before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// Clear all collections after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

// Drop the database and close the connection after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Auth API Integration Tests', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test HR',
                email: 'test@hr.com',
                password: 'password123',
                role: 'HR'
            });

        if (res.statusCode !== 201) require('fs').writeFileSync('err.log', JSON.stringify(res.body));

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('email', 'test@hr.com');
        expect(res.body).toHaveProperty('role', 'HR');

        // Verify the user was created in the database
        const userInDb = await User.findOne({ email: 'test@hr.com' });
        expect(userInDb).toBeTruthy();
        expect(userInDb.name).toBe('Test HR');
    });

    it('should login an existing user', async () => {
        // Create user first
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Candidate',
                email: 'test@candidate.com',
                password: 'password123',
                role: 'Candidate'
            });

        // Now attempt to login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@candidate.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role', 'Candidate');
    });

    it('should fail to login with wrong password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Admin',
                email: 'test@admin.com',
                password: 'password123',
                role: 'Admin'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@admin.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
});
