const nodemailer = require('nodemailer');
const colors = require('colors'); // For colored console logging

const sendEmail = async (options) => {
    // 1. Create a transporter using your .env variables from Mailtrap
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        // ✅ THIS IS THE KEY CHANGE:
        // If an `html` property is provided in the options, use it.
        // Otherwise, fall back to the plain `message` property.
        html: options.html,
        text: options.message, // This is a fallback for email clients that don't support HTML
    };

    // 3. Send the email and log the result
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent successfully to ${options.email}. Message ID: ${info.messageId}`.cyan);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`.red.bold, error);
        // We throw the error so the calling function knows something went wrong.
        // This is better than silently failing.
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;