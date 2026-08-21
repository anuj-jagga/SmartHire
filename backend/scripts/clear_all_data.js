const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDatabase = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully.');

        // 1. Clear all MongoDB collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\nFound ${collections.length} collection(s) to clear:`);

        for (const col of collections) {
            const collectionName = col.name;
            const countBefore = await mongoose.connection.db.collection(collectionName).countDocuments();
            const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
            console.log(`- Cleared collection "${collectionName}": removed ${result.deletedCount} of ${countBefore} documents.`);
        }

        // 2. Clear backend/uploads folder
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedFilesCount = 0;
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                // Keep .gitkeep if any, otherwise remove file
                if (file !== '.gitkeep') {
                    fs.unlinkSync(filePath);
                    deletedFilesCount++;
                }
            }
            console.log(`\nCleared backend/uploads directory: removed ${deletedFilesCount} file(s).`);
        } else {
            console.log('\nUploads directory does not exist.');
        }

        console.log('\n✅ Entire database and uploaded files cleared successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing database:', err);
        process.exit(1);
    }
};

clearDatabase();
