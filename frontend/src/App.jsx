import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    // Globally configure Axios so we don't have to keep setting it locally in random pages
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <Router>
      <div className="app-wrapper flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mt-8">
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
    </Router>
  );
}

export default App;
