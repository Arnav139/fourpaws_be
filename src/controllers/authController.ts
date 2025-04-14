import { Request, Response } from "express";
import redisClient from "../config/redis";
import { sendEmail } from "../utils/mail";
import UserService from "../services";
import { signJwt } from "../config/jwtConfig";

// POST /auth/register
export const registerUser = async (req: Request, res: any) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingUser = await UserService.userExists(email);
    if (existingUser) {
      const walletAddress = await UserService.getWalletAddressByEmail(email);
      if (walletAddress) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        return res.status(400).json({
          message: "User already exists, but wallet address is missing",
        });
      }
    }

    // Generate a 6-digit OTP and store it in Redis with a 5 minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res
      .status(500)
      .json({ success: false, error: "Unable to register user" });
  }
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
    // Insert the new user record (this might be deferred until OTP is verified in some flows)
    const user = await UserService.insertUser(email);
    console.log(user, "user");
    const token = signJwt(user.id, email);
    // You might generate a session or JWT token here to allow wallet update
    return res.status(200).json({
      token,
      success: true,
      message:
        "OTP verified successfully. You may now update your wallet address.",
      user,
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
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
    const userExists = await UserService.userExists(email);
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
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateWallet:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
