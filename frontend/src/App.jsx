import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import WebRTCInterview from './pages/WebRTCInterview';

function AppContent() {
  const { user } = useAuthStore();
  const location = useLocation();
  const isInterviewPage = location.pathname.startsWith('/interview');

  return (
    <div className="app-wrapper flex flex-col min-h-screen">
      {!isInterviewPage && <Navbar />}
      <main className={isInterviewPage ? "flex-1" : "flex-1 container mt-8 pb-20"}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/interview/:roomId" element={user ? <WebRTCInterview /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Globally configure Axios for cookie-based auth
    axios.defaults.withCredentials = true;
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
