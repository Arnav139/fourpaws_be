
import express from "express"
import upload from "../middlewares/multer";
import { authenticateUser } from "../middlewares";
import UploadController from "../controllers/uploadController";

 
const router = express.Router();

router.post("/upload",authenticateUser, upload.single("file"), UploadController.upload)

export default router;