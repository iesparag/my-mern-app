const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.hsbs_gmail_ID,
        pass: process.env.hsbs_gmail_password,
    },
});

// Function to send an email
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: "hsbs@gmail.com",
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const mailResponse = await transporter.sendMail(mailOptions);
        return mailResponse;
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = { sendEmail };
