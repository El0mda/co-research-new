import { Resend } from "resend";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured. Please connect Resend in your project settings.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(toEmail, code, lang = "ar") {
  const resend = getResendClient();
  const isArabic = lang === "ar";

  const subject = isArabic
    ? "رمز التحقق لمنصة Co-Research"
    : "Your Co-Research Verification Code";

  const html = isArabic
    ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">مرحباً بك في Co-Research</h2>
        <p style="color: #444; margin-bottom: 24px;">أدخل رمز التحقق أدناه لإتمام تسجيلك:</p>
        <div style="background: #1a1a2e; color: #f5c842; font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 24px; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">هذا الرمز صالح لمدة 15 دقيقة فقط. لا تشاركه مع أي شخص.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Welcome to Co-Research</h2>
        <p style="color: #444; margin-bottom: 24px;">Enter the verification code below to complete your registration:</p>
        <div style="background: #1a1a2e; color: #f5c842; font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 24px; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">This code is valid for 15 minutes only. Do not share it with anyone.</p>
      </div>
    `;

  const { data, error } = await resend.emails.send({
    from: "Co-Research <noreply@coresearch.app>",
    to: [toEmail],
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}
