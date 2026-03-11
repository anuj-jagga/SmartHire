const { io } = require('socket.io-client');

async function runTest() {
    console.log("Starting WebRTC socket test...");
    const caller = io('http://localhost:5000');
    const receiver = io('http://localhost:5000');

    // Wait for connection
    await new Promise(r => setTimeout(r, 1000));

    console.log(`Caller ID: ${caller.id} | Receiver ID: ${receiver.id}`);

    receiver.on('user-connected', (id) => console.log('Receiver saw:', id));
    caller.on('user-connected', (id) => console.log('Caller saw:', id));

    receiver.on('offer', (data) => {
        console.log('✅ Receiver got OFFER from', data.callerID);
        receiver.emit('answer', { target: data.callerID, signal: 'fake-answer', id: receiver.id });
    });

    caller.on('answer', (data) => {
        console.log('✅ Caller got ANSWER from', data.id);

        // Test Trickle ICE
        caller.emit('ice-candidate', { target: receiver.id, signal: 'fake-ice' });
    });

    receiver.on('ice-candidate', (data) => {
        console.log('✅ Receiver got ICE candidate');
        console.log('\n🎉 ALL SIGNALING EVENTS WORKED PERFECTLY 🎉');
        process.exit(0);
    });

    // Both join
    receiver.emit('join-room', 'test-room', 'receiver-user');

    setTimeout(() => {
        caller.emit('join-room', 'test-room', 'caller-user');
    }, 500);

    // Simulate offer
    setTimeout(() => {
        caller.emit('offer', { target: receiver.id, callerID: caller.id, signal: 'fake-offer' });
    }, 1000);

    setTimeout(() => {
        console.error("❌ Test Timed Out!");
        process.exit(1);
    }, 3000);
}

runTest();
