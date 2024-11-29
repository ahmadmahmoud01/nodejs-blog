import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure the transporter with environment variables
const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE, // Email service from environment variables
    auth: {
        user: process.env.MAIL_USER,    // Email user
        pass: process.env.MAIL_PASSWORD, // Email password
    },
});

// Verify transporter configuration
transporter.verify((error) => {
    if (error) {
        console.error('Error with mail transporter:', error);
    } else {
        console.log('Mail transporter configured successfully');
    }
});

// Function to send an email
const sendMail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER, // Default "from" address from environment variables
            to,
            subject,
            text,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendMail;
