import express from "express";
import { authenticateUser, validateRequest } from "../middlewares";
import { userController } from "../controllers/index";
import upload from "../middlewares/multer";
import { userValidators } from "../validators/index";

const router = express.Router();

router.get(
  "/profile",
  authenticateUser,
  validateRequest(userValidators.validateGetUser),
  userController.getUser
);

router.post(
  "/profile",
  authenticateUser,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  validateRequest(userValidators.validateUpdateUser),
  userController.updateUser
);

export default router;
