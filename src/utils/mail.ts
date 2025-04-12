import { transporter } from "./nodeMailer";

export async function sendEmail({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) {
  try {
    await transporter().sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject,
      html: message,
      text: message,
    });

    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      message: "Failed to send email. Please try again.",
    };
  }
}






