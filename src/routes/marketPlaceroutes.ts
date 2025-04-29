import express from "express";
import { marketPlaceController } from "../controllers";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";

const router = express.Router();

router.post(
  "/items",
  authenticateUser,
  upload.fields([{ name: "collectibleImage", maxCount: 1 }]),
  marketPlaceController.createCollectible
);

router.get("/items", authenticateUser, marketPlaceController.getCollectibles);

export default router;
