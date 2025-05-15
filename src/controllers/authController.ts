import { Request, Response } from "express";
import redisClient from "../config/redis";
import { UserService } from "../services";
import Mailer from "../utils/nodeMailer";
import { generateAuthTokens } from "../config/token";
import { otpToken } from "../config/common";
import { OAuth2Client } from "google-auth-library";
import { envConfigs } from "../config/envconfig";
export default class authController {
  static verifyOtp: any = async (req: Request, res: Response) => {
    try {
      const { otp, role } = req.body;
     
      if(role === "admin"){
        
      }

      let userExists = await Mailer.verifyOtp(
        req["user"] as any,
        otp as string
      );
      if (!userExists) {
        userExists = await UserService.insertUser(
          req["user"]["email"] as string
        );
      }
      const accessToken = generateAuthTokens(userExists.id, userExists.email);
      const user = {
        ...userExists,
        profileImage: userExists.profileImageUrl,
        accessToken,
      };
      return res
        .status(200)
        .send({ success: true, message: "user logged  in", user });
    } catch (error) {
      console.error("Error in verifyOtp:", error);
      return res.status(500).send({ success: false, error: "invalid otp" });
    }
  };
  
  // post /auth/login
  static loginUser = async (req: Request, res: any) => {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    try {
      const otp = await Mailer.sendEmail(email);

      let token = otpToken(email, otp);
      return res
        .status(200)
        .send({ success: true, message: "OTP Sent SuccessFully", token });
    } catch (error) {
      console.error("Error in loginUser:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  static googleLogin = async (req: Request, res: Response): Promise<any> => {
    try {
      // Extract idToken from request body
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }
      const client = new OAuth2Client();

      // Verify the idToken
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: envConfigs.AUDIENCE
      });

      // Get the payload from the verified token
      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Extract user details from payload
      const { sub: googleId, email, name, picture } = payload;

      let userExists = await UserService.getUser(email);

      if (!userExists) {
        userExists = await UserService.insertUser(email, name, picture);
      }
      const accessToken = generateAuthTokens(userExists.id, userExists.email);
      const user = {
        ...userExists,
        profileImage: userExists.profileImageUrl,
        accessToken,
      };
      return res
        .status(200)
        .send({ success: true, message: "user logged  in", user });
    } catch (error) {
      console.error("Error in google login", error);
      return res.status(500).send({ success: false, error: "invalid otp" });
    }
  };

  // POST /auth/update-wallet
  static updateWallet = async (req: Request, res: any) => {
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
        user: {
          ...updatedUser,
          profileImage: updatedUser.profileImageUrl,
        },
      });
    } catch (error) {
      console.error("Error in updateWallet:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
}
