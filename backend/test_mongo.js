const mongoose = require('mongoose');

async function testMongo() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect('mongodb://127.0.0.1:27017/smarthire');
        console.log("Successfully connected to MongoDB.");
        process.exit(0);
    } catch (e) {
        console.error("MongoDB Connection Error:", e);
        process.exit(1);
    }
}
testMongo();
