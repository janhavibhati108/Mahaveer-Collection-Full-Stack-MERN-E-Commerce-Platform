import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
    console.log("EMAIL_USER =", process.env.EMAIL_USER);
    console.log(
        "EMAIL_PASS =",
        process.env.EMAIL_PASS ? "FOUND" : "NOT FOUND"
    );

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification",
        html: `
      <h2>Your OTP is</h2>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes.</p>
    `,
    });
};