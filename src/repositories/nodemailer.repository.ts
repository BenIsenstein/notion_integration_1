import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    requireTLS: true,
    host: process.env.AWS_SMTP_HOST,
    port: 587,
    auth: {
        user: process.env.AWS_SMTP_USER,
        pass: process.env.AWS_SMTP_PASS,
    },
})