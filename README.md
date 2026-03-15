# SmartHire - Interview & Placement Management System

A full-stack MERN application with a premium, modern design created as an impressive resume project. Feature-rich role-based dashboards for Candidates, HR Professionals, and Admins.

## Features
- **Modern User Interface**: Premium aesthetics with glassmorphism, glowing gradients, and fluid micro-animations.
- **Role-Based Access Control**: Tailored experiences for Candidates (apply for jobs), HR (post jobs, review applicants), and Admin (system overview).
- **Authentication**: Secure JWT-based auth flow with bcrypt hashed passwords.
- **RESTful API**: Node.js/Express backend integrated with MongoDB.

## Tech Stack
- **Frontend**: React, Vite, Custom CSS Design System, Zustand, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Socket.io
- **Security**: HTTP-only Cookies, CSRF protection principles
- **Real-time**: Native WebRTC, STUN/TURN Signaling

## 🚀 Recent Enhancements (Production Ready)
This project has been recently upgraded to meet professional production standards:

1. **Native WebRTC Interviewing**: 
   - Engineered a custom signaling layer using Socket.io for peer-to-peer video communication.
   - Implemented "Nuclear Cleanup" logic to prevent browser memory leaks and persistent camera/mic usage.
   - Configured ICE servers (STUN/TURN) for reliable connectivity across firewalls.

2. **Hardened Security Architecture**:
   - Migrated from localStorage to **secure HTTP-only cookies** for JWT storage, mitigating XSS risks.
   - Implemented centralized auth middleware with cookie-token extraction.

3. **Live Pipeline Observability**:
   - Dedicated **Analytics Engine** to track system-wide events (registrations, logins, application status changes).
   - Integrated a real-time **Pipeline Activity Feed** on the Admin Dashboard for visual monitoring.

4. **Premium UI/UX Polishing**:
   - Refined layouts with branded gradients and glassmorphism.
   - Contextual interview headers (e.g., "Position: AI Handler") for improved user clarity.

## Getting Started

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Setup Environment Variables: Create a `.env` file in the `backend` directory.
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smarthire
   JWT_SECRET=your_super_secret_key_here
   ```
4. Start the server: `npm run dev` (Runs on port 5000)

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. The application should open automatically or be available at `http://localhost:5173`.

## Demo Flow
1. **Register as HR**: Create an account via `/register` and select "HR Professional". This takes you to the HR Dashboard where you can "Post New Job" (Mock UI available, API integrated for data retrieval).
2. **Register as Candidate**: Open an incognito window, register as "Candidate". You will see available jobs.
3. **Apply**: Click "View Details" on a job and submit an application.
4. **Review**: Go back to the HR view, refresh, and see the incoming application from the candidate.

## License
MIT
