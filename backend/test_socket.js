const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Test Client Connected:', socket.id);
    socket.emit('join-room', 'test-room-1234', 'test-user-id');
});

socket.on('user-connected', (userId) => {
    console.log('Received user-connected:', userId);
});

socket.on('connect_error', (err) => {
    console.error('Socket error:', err);
});

// Wait 2 seconds for connection
setTimeout(() => {
    console.log("Exiting test.");
    process.exit(0);
}, 2000);
