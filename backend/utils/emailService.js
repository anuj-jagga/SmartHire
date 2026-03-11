const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        let transporter;

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            // Provide a real configuration for Gmail here
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            // Fallback for easy testing if no real credentials exist
            console.log("\n[!] No SMTP_USER in .env. Falling back to Ethereal Testing...");
            const testAccount = await nodemailer.createTestAccount();

            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: process.env.SMTP_USER ? `"SmartHire HR" <${process.env.SMTP_USER}>` : '"SmartHire Test System" <hr@smarthire.test>',
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("=======================================");
        console.log("Email sent successfully: %s", info.messageId);

        if (!process.env.SMTP_USER) {
            console.log("Ethereal Testing - Click the URL to View Email Preview in Browser:");
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(previewUrl);
            info.previewUrl = previewUrl;
        }
        console.log("=======================================\n");

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};

module.exports = {
    sendEmail
};
