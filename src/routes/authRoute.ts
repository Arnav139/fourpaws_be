import express from "express";
import { registerUser, verifyOtp, updateWallet } from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser)
router.post("/verify-otp", verifyOtp)
router.post("/update-wallet", updateWallet)

export default router;

