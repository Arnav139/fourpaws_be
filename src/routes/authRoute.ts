import express from "express";
import {authController} from "../controllers/index";
import { authenticateUser } from "../middlewares";


const router = express.Router();

// router.post("/register", registerUser)
router.post("/login",authController.loginUser)
router.post("/verify-otp",authenticateUser, authController.verifyOtp)
router.post("/update-wallet",authenticateUser, authController.updateWallet)

export default router;

