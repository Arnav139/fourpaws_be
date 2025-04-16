import { Request, Response } from "express";
import redisClient from "../config/redis";
import {UserService} from "../services";
import Mailer from "../utils/nodeMailer";
import { generateAuthTokens } from "../config/token";
import { otpToken } from "../config/common";


export default class authController{
  static verifyOtp:any = async(req:Request,res:Response)=>{
    try {
      const {otp} = req.body;
      console.log(req['user'],"in controller");
      let userExists = await Mailer.verifyOtp(req['user'] as any,otp);
      let message = "User Logged In";
      let newUser = false;
      if (!userExists) {
        const createBody:any = {
          email:{
            email:req['user']['email'],
          }
        };
        const dbUser = await UserService.getUser(createBody.email.email);
        if (dbUser) {
          return res.status(400).send({status:false,message:"User already exists"});
        }
        userExists = await UserService.insertUser(createBody.email.email);
        message = "User Signed Up";
        newUser = true;
      }
      const accessToken = await generateAuthTokens(userExists.id);
      return res.status(200).send({status: true,message:message,data: accessToken,});
    } catch (error) {
      console.log(error)
      return res.status(500).send({status:false,message:"invalid  otp"});
    }
  }
  
  // post /auth/login
static loginUser = async (req: Request, res: any) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }
  
    try {
      const otp= await Mailer.sendEmail(email)
      let token = otpToken(email,otp);
      return res.status(200).send({status:true,message:"OTP Sent SuccessFully",token})
  
    } catch (error) {
      console.error("Error in loginUser:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
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
}


