const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        let transporter;

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            console.log("\n[!] No SMTP credentials in .env. Using Ethereal test account...");
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
            from: process.env.SMTP_USER ? `"SmartHire HR" <${process.env.SMTP_USER}>` : '"SmartHire HR" <hr@smarthire.local>',
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);

        if (!process.env.SMTP_USER) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("Email Preview URL:", previewUrl);
            info.previewUrl = previewUrl;
        }

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};

module.exports = {
    sendEmail
};
