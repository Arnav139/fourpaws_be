import { Request, Response } from "express";
import redisClient from "../config/redis";
import { sendEmail } from "../utils/mail";
import UserService from "../services";
import { signJwt } from "../config/jwtConfig";

const sendOtp = async (email: string) => {
  // Generate a 6-digit OTP and store it in Redis with a 5 minute expiration
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp); // For debugging purposes
  const redisKey = `OTP:${email}`;
  await redisClient.set(redisKey, otp, "EX", 300); // 300 seconds = 5 minutes

  // Send OTP email
  await sendEmail({
    email,
    subject: "Knock Knock... OTP's Here! Open Up!",
    message: `
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
            <div class="otp-box">${otp}</div>
            <p>Act fast! This OTP expires in 5 minutes.</p>
          </div>
        </body>
      </html>
    `,
  });
};


// POST /auth/verify-otp
export const verifyOtp = async (req: Request, res: any) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: "Email and OTP are required",
    });
  }

  try {
    const redisKey = `OTP:${email}`;
    const storedOtp = await redisClient.get(redisKey);
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired or is invalid",
      });
    }
    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Incorrect OTP",
      });
    }
    // OTP verified; delete it from Redis
    await redisClient.del(redisKey);
    // Check if the user already exists
    let user = await UserService.getUser(email);
    if (!user) {
      user = await UserService.insertUser(email);
    }

    const token = signJwt(user.id, email);
    // You might generate a session or JWT token here to allow wallet update
    return res.status(200).json({
  
      success: true,
      message:
        "OTP verified successfully. You may now update your wallet address.",
      user: {...user, accessToken:token},
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// post /auth/login
export const loginUser = async (req: Request, res: any) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    await sendOtp(email);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// POST /auth/update-wallet
export const updateWallet = async (req: Request, res: any) => {
  const { email, walletAddress } = req.body;

  if (!email || !walletAddress) {
    return res.status(400).json({
      success: false,
      error: "Email and wallet address are required",
    });
  }

  try {
    // Check if the user exists
    const userExists = await UserService.getUser(email);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        error: "User does not exist, please register first",
      });
    }

    // Check if wallet address is already set
    const currentWalletAddress = await UserService.getWalletAddressByEmail(
      email
    );
    if (currentWalletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address already set",
      });
    }

    // Update the wallet address
    const updatedUser = await UserService.updateWalletAddress(
      email,
      walletAddress
    );
    return res.status(200).json({
      success: true,
      message: "Wallet address updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateWallet:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
