import express from "express";
// import { getPosts, getStories,getCommentsByPostId} from "../controllers/feedController";
import { FeedController } from "../controllers/index";
import { authenticateUser } from "../middlewares";
import upload from "../middlewares/multer";
import { checkFileSizeByType } from "../middlewares/checkFileSizeByType";
import { check } from "drizzle-orm/gel-core";

const router = express.Router();

router.get("/posts", authenticateUser, FeedController.getPosts);
router.get("/stories",authenticateUser, FeedController.getAllStories);
router.get("/posts/:postId", authenticateUser, FeedController.getPostById);
router.get(
  "/posts/:postId/comments",
  authenticateUser,
  FeedController.getCommentsByPostId,
);

router.post(
  "/posts/:postId/comments",
  authenticateUser,
  FeedController.addCommentByPostId,
);
router.post(
  "/posts/:postId/like",
  authenticateUser,
  FeedController.togglePostLike,
);
router.post(
  "/comments/:commentId/like",
  authenticateUser,
  FeedController.toggleCommentLike,
);
router.post(
  "/posts",
  authenticateUser,
  upload.fields([
    { name: "postImage", maxCount: 1 },
    { name: "postVideo", maxCount: 1 },
  ]),
  FeedController.createPost,
);

export default router;
