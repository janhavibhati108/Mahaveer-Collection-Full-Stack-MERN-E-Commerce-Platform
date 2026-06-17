import SibApiV3Sdk from "@getbrevo/brevo";

export const sendOtpEmail = async (email, otp) => {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "OTP Verification - Mahaveer Collection";
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = {
        name: "Mahaveer Collection",
        email: process.env.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="text-align: center; color: #333;">Mahaveer Collection</h2>
            <p style="text-align: center; color: #555;">Your OTP for verification is:</p>
            <h1 style="text-align: center; letter-spacing: 8px; color: #4f46e5; font-size: 36px;">${otp}</h1>
            <p style="text-align: center; color: #888; font-size: 13px;">Valid for 5 minutes. Do not share this with anyone.</p>
        </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
};