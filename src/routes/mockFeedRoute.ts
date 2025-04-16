import express from "express"
// import { getPosts, getStories,getCommentsByPostId} from "../controllers/feedController";
import {feedController} from "../controllers/index";

const router = express.Router();

router.get("/posts", feedController.getPosts)
router.get("/stories", feedController.getStories)
router.get("/posts/:postId/comments", feedController.getCommentsByPostId)

export default router;