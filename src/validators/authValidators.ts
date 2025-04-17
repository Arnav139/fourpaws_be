import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export default class AuthValidators {
  // verifyOtp validator
  static validateVerifyOtp = z.object({
    body: z.object({
      otp: z
        .string({ required_error: "OTP is required" })
        .min(1, "OTP must be a non-empty string"),
    }).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // loginUser validator
  static validateLoginUser = z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format"),
    }).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // updateWallet validator
  static validateUpdateWallet = z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format"),
      walletAddress: z
        .string({ required_error: "Wallet address is required" })
        .min(1, "Wallet address must be a non-empty string")
        // Optional: Add regex for Ethereum-like wallet addresses
        .regex(/^0x[a-fA-F0-9]{40}$/, {
          message: "Invalid wallet address format",
        }), 
    }).strict(),
    params: z.object({}).strict(),
    query: z.object({}).strict(),
  });

  // Middleware to apply validators
  static applyValidator(validator: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        validator.parse({
          body: req.body,
          params: req.params,
          query: req.query,
        });
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            error: "Invalid request data",
            details: error.errors,
          });
        }
        return res.status(500).json({
          success: false,
          error: "Internal Server Error",
        });
      }
    };
  }
}