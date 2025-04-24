import express from "express";
// import { getPosts, getStories,getCommentsByPostId} from "../controllers/feedController";
import { FeedController } from "../controllers/index";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";
import { checkFileSizeByType } from "../middlewares/checkFileSizeByType";

const router = express.Router();

router.get("/posts", authenticateUser, FeedController.getPosts);
router.get("/stories", FeedController.getStories);
router.get("/posts/:postId/comments", FeedController.getCommentsByPostId);
router.post("/posts/:postId/like", authenticateUser, FeedController.toggleLike);

router.post(
  "/posts",
  authenticateUser,
  upload.fields([{ name: "postImage", maxCount: 1 }, checkFileSizeByType]),
  FeedController.createPost,
);

export default router;
