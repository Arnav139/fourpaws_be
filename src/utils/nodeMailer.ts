import nodemailer from "nodemailer";
import { envConfigs } from "../config/envconfig";
import { verifyOtpHash } from "../config/common";
import { UserService } from "../services";

export default class Mailer {
  static emailTemplate = (code: any) => `
  <html>
        <head>
          <title>Email Verification – Prove You're Real</title>
          <style>
            /* (Styles omitted for brevity. Use your existing HTML email styles.) */
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔥Hello🔥</h1>
            <p>So, you've decided to sign up on <strong>Four Paws</strong>.<br> Bold move. Big dreams. We respect that.</p>
            <p>But let's be real—do you even exist? 🤔 Here's your highly classified OTP:</p>
            <div class="otp-box">${code}</div>
            <p>Act fast! This OTP expires in 5 minutes.</p>
          </div>
        </body>
      </html>
    `;

  static generateOtp = async () => {
    try {
      return Math.floor(100000 + Math.random() * 900000);
    } catch (error) {
      throw new Error(error);
    }
  };

  static sendEmail = async (to: string): Promise<any> => {
    try {
      const otp = await this.generateOtp();
      let htmlContent = this.emailTemplate(otp);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, // Use 465 for secure connections
        secure: false, // Set true for port 465
        auth: {
          user: envConfigs.nodemailerUser, // Your email
          pass: envConfigs.nodemailerApikey, // Your email password or application-specific password
        },
      });

      // Email options
      const mailOptions = {
        from: envConfigs.nodemailerUser, // Sender address
        to: to, // Receiver email
        subject: "Knock Knock... OTP's Here! Open Up!",
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("Email sent: %s", info.messageId);
      return otp;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  static verifyOtp = async (
    decodedTokenData: any,
    otp: string,
  ): Promise<any> => {
    console.log(
      'decodedTokenData["otp"],decodedTokenData["email"],otp',
      decodedTokenData["otp"],
      decodedTokenData["email"],
      otp,
    );
    try {
      if (
        !verifyOtpHash(decodedTokenData["otp"], decodedTokenData["email"], otp)
      ) {
        throw new Error("invalid otp provided");
      }
      return await UserService.getUser(decodedTokenData["email"]);
    } catch (error) {
      throw new Error(`Error while verifying otp: ${error.message}`);
    }
  };
}
