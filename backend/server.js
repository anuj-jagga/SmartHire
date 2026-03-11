const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

// Ensure .env is loaded
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io WebRTC Signaling Logic
io.on('connection', (socket) => {
  console.log(`[Socket] User Connected: ${socket.id}`);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`[Socket] User ${userId} (${socket.id}) joined room: ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit('user-connected', socket.id);

    // WebRTC Signaling Events
    socket.on('offer', (payload) => {
      io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
      io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (payload) => {
      io.to(payload.target).emit('ice-candidate', payload);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User Disconnected: ${socket.id}`);
      socket.to(roomId).emit('user-disconnected', socket.id);
    });
  });
});


// Express middleware and routes have been moved to app.js for Unit Testing separation

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Start BullMQ Worker
require('./workers/emailWorker');
// Trigger restart

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server & Socket.io running on port ${PORT}`));
