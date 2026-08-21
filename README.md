# SmartHire

A recruitment and interview web app built with React, Node.js, Express, and MongoDB. It includes role-based access for Candidates, HR, and Admins, live 1-on-1 video interviews using WebRTC, and background email processing with BullMQ and Redis.

## Features

- **Candidate Portal**: Browse job listings, apply with resume uploads, and join video interview rooms.
- **HR Portal**: Post jobs, review applicants, download resumes, and generate interview links.
- **Admin Dashboard**: Overview of platform activity and application metrics.
- **Video Interviews**: Real-time peer-to-peer video calls using WebRTC and Socket.IO for signaling.
- **Background Tasks**: Asynchronous email notifications handled via BullMQ and Redis.
- **Authentication**: JWT authentication with bcrypt password hashing and protected routes.

## Tech Stack

- **Frontend**: React (Vite), Zustand, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, Multer
- **Database**: MongoDB (Mongoose)
- **Queue**: BullMQ, Redis

## Setup & Local Development

### 1. Install dependencies

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smarthire
JWT_SECRET=your_jwt_secret
```

### 3. Start the project

Make sure MongoDB and Redis are running locally, then start both servers:

```bash
# Start backend (http://localhost:5000)
cd backend
npm run dev

# In another terminal, start frontend (http://localhost:5173)
cd frontend
npm run dev
```
