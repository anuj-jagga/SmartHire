# SmartHire - Interview & Placement Management System

A full-stack MERN platform for managing recruitment workflows with real-time video interviews, secure authentication, and a premium performance-driven UI.

🔗 **Live Demo**: [Coming Soon]  
📂 **Backend Repo**: [Link to your repo]

---

## 📸 Screenshots

### 👨💻 Candidate Dashboard – Browse Jobs
![Candidate Dashboard](./screenshots/candidate-dashboard.png)

### 🧑💼 HR Dashboard – Manage Job Postings
![HR Dashboard](./screenshots/hr-dashboard.png)

### 🎥 Real-Time Interview (WebRTC)
Peer-to-peer video interview with live participant tracking and media controls.

![Interview Screen](./screenshots/interview.png)

---

## 💡 About & Motivation

SmartHire was built to bridge the gap between application tracking and live interviewing. This project simulates a real-world enterprise recruitment pipeline, focusing on security, real-time communication, and a "wow-factor" user experience.

---

## 🚀 Key Features

### 👤 Role-Based Workflows
- **Candidate**: Browse jobs, view detailed descriptions, and apply with a single click.
- **HR Professional**: Post new job openings, manage applicants, and initiate interviews.
- **Admin**: Monitor system-wide activity feeds and user registrations.

### 🔐 Security & Auth
- **HTTP-Only Cookies**: JWT tokens are stored in secure cookies to prevent XSS attacks.
- **Bcrypt**: Industrial-grade password hashing for user data protection.
- **Protected Routes**: Granular access control for API endpoints and UI views.

### 🎥 Native WebRTC Interviews
- **Peer-to-Peer**: High-performance real-time video/audio communication.
- **Draggable PiP**: Custom-built draggable local video preview for a better user experience.
- **Live Monitoring**: Pulsating status indicators for a professional room atmosphere.

---

## 🏗️ Architecture

- **Frontend**: React (Vite) + Zustand (State Management) + Axios.
- **Backend**: Node.js & Express REST APIs.
- **Real-time**: Socket.IO for WebRTC signaling and live pipeline updates.
- **Database**: MongoDB Atlas (Cloud Managed Service) for persistent storage.

---

## 🔥 Technical Highlights & Enhancements

- **Cloud Migration**: Successfully migrated the database layer from local MongoDB to **MongoDB Atlas** for production-grade reliability and scalability.
- **WebRTC Reliability**: Implemented ICE servers (STUN/TURN) to ensure connectivity across restrictive corporate firewalls.
- **Memory Optimization**: Built "Nuclear Cleanup" logic to handle MediaStream track termination, preventing memory leaks and rogue camera usage.
- **Observability**: Designed a custom Analytics Engine to log system events and broadcast them to the Admin dashboard in real-time.

---

## 🛠️ Installation & Setup

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
*Requires a `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`.*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

To run this project, you will need to add the following variables to your `backend/.env` file:

`PORT=5000`  
`MONGO_URI=mongodb+srv://...` (Your MongoDB Atlas URI)  
`JWT_SECRET=your_jwt_secret`

---

## 🧪 Demo Flow
1. **Register** as a "Candidate" or "HR Professional".
2. **HR**: Post a job to see it appear in the global feed.
3. **Candidate**: Apply for the job to trigger a real-time notification.
4. **Interview**: Join the generated room ID to start a peer-to-peer video call.

---

## 📄 License
MIT
