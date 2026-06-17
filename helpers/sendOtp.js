import { Resend } from "resend";

export const sendOtpEmail = async (email, otp) => {
    // ✅ create inside function so env var is available at call time
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: "Mahaveer Collection <onboarding@resend.dev>",
        to: email,
        subject: "OTP Verification",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="text-align: center; color: #333;">Mahaveer Collection</h2>
                <p style="text-align: center; color: #555;">Your OTP for verification is:</p>
                <h1 style="text-align: center; letter-spacing: 8px; color: #4f46e5; font-size: 36px;">${otp}</h1>
                <p style="text-align: center; color: #888; font-size: 13px;">Valid for 5 minutes. Do not share this with anyone.</p>
            </div>
        `,
    });
};