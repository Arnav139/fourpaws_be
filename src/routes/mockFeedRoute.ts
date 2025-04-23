import express from "express";
// import { getPosts, getStories,getCommentsByPostId} from "../controllers/feedController";
import { feedController } from "../controllers/index";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";
import  {checkFileSizeByType}  from "../middlewares/checkFileSizeByType";

const router = express.Router();

router.get("/posts", feedController.getPosts);
router.get("/stories", feedController.getStories);
router.get("/posts/:postId/comments", feedController.getCommentsByPostId);
router.post("/posts", authenticateUser,upload.fields([
    { name: "postImage", maxCount: 1 },checkFileSizeByType,
]),feedController.createPost);
export default router;
