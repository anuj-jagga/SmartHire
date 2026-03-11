const { Queue } = require('bullmq');
const { sendEmail } = require('../utils/emailService');

const redisUrl = process.env.REDIS_URL;

let emailQueue;
let connection = null;

if (redisUrl) {
    const Redis = require('ioredis');
    connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    emailQueue = new Queue('email-dispatch-queue', { connection });
    console.log('📦 BullMQ Email Queue Initialized (Using Real Redis)');
} else {
    console.log('⚠️ REDIS_URL not found. BullMQ bypassed. Emails will send synchronously.');
    emailQueue = {
        add: async (jobName, data) => {
            console.log(`[Mock Queue] Processing job ${jobName} synchronously...`);
            try {
                await sendEmail(data.options);
                console.log(`[Mock Queue] Job ${jobName} completed.`);
            } catch (err) {
                console.error(`[Mock Queue] Job ${jobName} failed:`, err.message);
            }
        }
    };
}

module.exports = {
    emailQueue,
    connection
};
