import express from "express";
import { getCollectibles } from "../controllers/marketplaceController";

const router = express.Router();


router.get("/items", getCollectibles);

export default router;
