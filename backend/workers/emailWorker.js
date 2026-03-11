const { Worker } = require('bullmq');
const { connection } = require('../config/queue');
const { sendEmail } = require('../utils/emailService');

let emailWorker = null;

if (connection) {
    emailWorker = new Worker('email-dispatch-queue', async (job) => {
        console.log(`[Worker] Started processing email job ${job.id}`);
        const { options } = job.data;
        const info = await sendEmail(options);
        if (!info) {
            throw new Error('Email failed to send, triggering BullMQ retry...');
        }
        return info;
    }, {
        connection,
        concurrency: 5
    });

    emailWorker.on('completed', (job, returnvalue) => {
        console.log(`[Worker] ✨ Email Job ${job.id} completed successfully!`);
    });

    emailWorker.on('failed', (job, err) => {
        console.log(`[Worker] ❌ Email Job ${job.id} failed with error: ${err.message}`);
    });
} else {
    console.log('⚠️ Worker skipped because real Redis connection is not configured.');
}

module.exports = emailWorker;
