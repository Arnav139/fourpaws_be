import express from "express";
import { authController } from "../controllers/index";
import { authenticateUser, validateRequest } from "../middlewares";
import { AuthValidators } from "../validators/index";

const router = express.Router();

// router.post("/register", registerUser)
router.post(
  "/login",
  validateRequest(AuthValidators.validateLoginUser),
  authController.loginUser,
);
router.post(
  "/verify-otp",
  authenticateUser,
  validateRequest(AuthValidators.validateVerifyOtp),
  authController.verifyOtp,
);
router.post(
  "/update-wallet",
  authenticateUser,
  validateRequest(AuthValidators.validateUpdateWallet),
  authController.updateWallet,
);

export default router;
