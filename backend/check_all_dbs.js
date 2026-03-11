const mongoose = require('mongoose');

const checkAllDBs = async () => {
    try {
        const client = await mongoose.connect('mongodb://127.0.0.1:27017');
        const admin = client.connection.db.admin();
        const dbs = await admin.listDatabases();

        console.log('Databases found:', dbs.databases.map(d => d.name));

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'config', 'local'].includes(dbName)) continue;

            const db = client.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name);

            if (collectionNames.includes('users')) {
                const users = await db.collection('users').find({}).toArray();
                console.log(`DB: ${dbName} - Users found: ${users.length}`);
                users.forEach(u => console.log(`  - ${u.email} (${u.role || 'no-role'})`));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkAllDBs();
