import express from "express";
import { marketPlaceController } from "../controllers";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";

const router = express.Router();

router.get("/items",authenticateUser, upload.fields([{name:"collectibleImage", maxCount:1}]), marketPlaceController.getCollectibles);

export default router;
