import express from "express";
import { verifyOtp, updateWallet,loginUser } from "../controllers/authController";
import { verifyToken } from "../middlewares/authmiddlware";


const router = express.Router();

// router.post("/register", registerUser)
router.post("/login",loginUser)
router.post("/verify-otp", verifyOtp)
router.post("/update-wallet",verifyToken, updateWallet)

export default router;

