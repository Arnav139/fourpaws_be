import express from "express";
import { authenticateUser } from "../middlewares";
import { userController } from "../controllers/index";
import upload from "../middlewares/multer";

const router = express.Router();

router.get("/profile", authenticateUser, userController.getUser);

router.post(
  "/profile",
  authenticateUser,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  userController.updateUser,
);

export default router;
