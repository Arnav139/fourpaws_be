import express from "express";
import { verifyOtp, updateWallet,loginUser } from "../controllers/authController";
import { authenticateUser } from "../middlewares";


const router = express.Router();

// router.post("/register", registerUser)
router.post("/login",loginUser)
router.post("/verify-otp",authenticateUser, verifyOtp)
router.post("/update-wallet",authenticateUser, updateWallet)

export default router;

