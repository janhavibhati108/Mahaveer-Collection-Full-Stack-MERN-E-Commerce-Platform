import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Mahaveer Collection" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "OTP Verification",
        html: `
            <h2>Your OTP is</h2>
            <h1 style="letter-spacing: 4px;">${otp}</h1>
            <p>Valid for 5 minutes.</p>
        `,
    });
};