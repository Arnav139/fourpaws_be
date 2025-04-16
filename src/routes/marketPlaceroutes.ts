import express from "express";
import { marketPlaceController } from "../controllers";

const router = express.Router();

router.get("/items", marketPlaceController.getCollectibles);

export default router;
